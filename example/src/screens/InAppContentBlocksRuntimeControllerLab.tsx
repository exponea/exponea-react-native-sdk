import React, { useRef, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Exponea, {
  InAppContentBlockInvalidateMode,
  InAppContentBlocksPlaceholder,
} from 'react-native-exponea-sdk';

import { AutomationIds } from '@/automation/AutomationIds';
import ExponeaButton from '@/components/ExponeaButton';
import ExponeaContainer from '@/components/ExponeaContainer';

const DEFAULT_DEADLINE_MS = 3000;
const MAX_LOG_LINES = 200;
const LIFECYCLE_SETTLE_MS = 3000;
const LAZY_INVALIDATE_PAUSE_MS = 500;
const TIMEOUT_PROBE_DEADLINE_MS = 1;
const FIRST_CUSTOMER_ID = 'user_a';
const SECOND_CUSTOMER_ID = 'user_b';

const SCENARIO_BUTTONS: {
  name: ScenarioName;
  title: string;
  testID?: string;
}[] = [
  {
    name: 'prefetch',
    title: 'Prefetch',
    testID: AutomationIds.CB_RUNTIME_PREFETCH,
  },
  {
    name: 'availability',
    title: 'Availability',
    testID: AutomationIds.CB_RUNTIME_AVAILABILITY,
  },
  {
    name: 'eager invalidate',
    title: 'Prefetch → eager invalidate → availability',
    testID: AutomationIds.CB_RUNTIME_INVALIDATE,
  },
  ...(
    [
      'happy path',
      'post-login CMS',
      'logout',
      'availability timeout',
      'anonymize lifecycle probe',
      'identity switch',
      'lazy invalidate',
    ] as const
  ).map((name) => ({
    name,
    title: name,
    testID: name === 'logout' ? AutomationIds.CB_RUNTIME_LOGOUT : undefined,
  })),
];
type ScenarioName =
  | 'prefetch'
  | 'availability'
  | 'eager invalidate'
  | 'happy path'
  | 'post-login CMS'
  | 'logout'
  | 'availability timeout'
  | 'anonymize lifecycle probe'
  | 'identity switch'
  | 'lazy invalidate';

const pause = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Keep inputs across lab unmounts when navigating between tabs or screens.
// These values last for the current JavaScript app session.
const lastInputs: { idsText?: string; deadlineText: string } = {
  deadlineText: String(DEFAULT_DEADLINE_MS),
};

export default function InAppContentBlocksRuntimeControllerLab({
  platformPlaceholderId,
}: {
  platformPlaceholderId: string;
}) {
  const [idsText, setIdsText] = useState(
    () => lastInputs.idsText ?? `example_top, ${platformPlaceholderId}`
  );
  const [deadlineText, setDeadlineText] = useState(
    () => lastInputs.deadlineText
  );
  const updateIdsText = (value: string) => {
    lastInputs.idsText = value;
    setIdsText(value);
  };
  const updateDeadlineText = (value: string) => {
    lastInputs.deadlineText = value;
    setDeadlineText(value);
  };
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const [mounted, setMounted] = useState<string[]>([]);
  const [mountVersion, setMountVersion] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const log = (message: string) => {
    const line = `${new Date().toISOString()} ${message}`;
    setLogs((previous) => [...previous.slice(-(MAX_LOG_LINES - 1)), line]);
  };

  const run = async (name: ScenarioName) => {
    if (running.current) return;
    const ids = [
      ...new Set(
        idsText
          .split(/[,\n]/)
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];
    const deadline = Number(deadlineText.trim());
    if (
      !ids.length ||
      !deadlineText.trim() ||
      !Number.isFinite(deadline) ||
      deadline < 0
    ) {
      log(
        'WARN: Enter at least one placeholder ID and a non-negative deadline in milliseconds.'
      );
      return;
    }
    const requireController = () => {
      const controller = Exponea.inAppContentBlocksController;
      if (!controller) throw new Error('SDK is not configured');
      return controller;
    };
    running.current = true;
    setBusy(true);
    log(`BEGIN ${name} ids=${ids.join(', ')} deadline=${deadline}ms`);
    try {
      const controller = requireController();
      const prefetch = async () => {
        log(
          `prefetch: ${JSON.stringify(await requireController().prefetch(ids))}`
        );
      };
      const availability = async (timeout = deadline, allIds = ids) => {
        for (const id of allIds) {
          log(
            `availability(${id}, ${timeout}ms): ${JSON.stringify(await requireController().availability(id, timeout))}`
          );
        }
      };
      const invalidate = async (mode: InAppContentBlockInvalidateMode) => {
        await requireController().invalidate(ids, `example lab: ${name}`, mode);
        log(
          `invalidate(${mode}): accepted; reload completion is checked separately`
        );
      };
      const mount = () => {
        setMountVersion((version) => version + 1);
        setMounted(ids);
        log(
          'Mount placeholders after prefetch; React Native loads them automatically on mount.'
        );
      };
      const anonymize = async () => {
        log('anonymize');
        await Exponea.anonymize();
      };
      const identify = async (id: string) => {
        log(`identify registered=${id}`);
        await Exponea.identifyCustomer({ customerIds: { registered: id } });
      };
      switch (name) {
        case 'prefetch':
          log(
            `prefetch snapshot: ${JSON.stringify(await controller.prefetch(ids, deadline))}`
          );
          break;
        case 'availability':
          await availability();
          break;
        case 'eager invalidate':
          // Deliberately does what the docs warn against: invalidating right after a
          // ready prefetch discards the warmed content. The final availability shows
          // the reload; this is a diagnostic scenario, not an integration pattern.
          await prefetch();
          await invalidate(InAppContentBlockInvalidateMode.EAGER);
          await availability();
          break;
        case 'happy path':
          await prefetch();
          mount();
          break;
        case 'post-login CMS':
          await identify(FIRST_CUSTOMER_ID);
          await prefetch();
          mount();
          break;
        case 'logout':
          await prefetch();
          await anonymize();
          await prefetch();
          break;
        case 'availability timeout':
          await invalidate(InAppContentBlockInvalidateMode.EAGER);
          // A warm/fast response can resolve even within 1ms; report the actual decision.
          await availability(TIMEOUT_PROBE_DEADLINE_MS, ids.slice(0, 1));
          break;
        case 'anonymize lifecycle probe':
          await prefetch();
          await anonymize();
          log('Immediate post-anonymize prefetch');
          await prefetch();
          await pause(LIFECYCLE_SETTLE_MS);
          log('Settled post-anonymize prefetch');
          await prefetch();
          break;
        case 'identity switch':
          await identify(FIRST_CUSTOMER_ID);
          await prefetch();
          await identify(SECOND_CUSTOMER_ID);
          await prefetch();
          break;
        case 'lazy invalidate':
          await prefetch();
          await invalidate(InAppContentBlockInvalidateMode.LAZY);
          log(`Pause ${LAZY_INVALIDATE_PAUSE_MS}ms without accessing content`);
          await pause(LAZY_INVALIDATE_PAUSE_MS);
          await prefetch();
          break;
      }
      log(`END ${name}`);
    } catch (error) {
      log(
        `FAILED ${name}: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  };

  return (
    <ExponeaContainer
      title="Runtime ICB Lab"
      hint="Exponea.inAppContentBlocksController"
    >
      <Text>
        Controller:{' '}
        {Exponea.inAppContentBlocksController ? 'present' : 'not configured'}
      </Text>
      <Text>Placeholder IDs (comma-separated or one per line)</Text>
      <TextInput
        style={styles.input}
        multiline
        value={idsText}
        onChangeText={updateIdsText}
        editable={!busy}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text>Availability / prefetch snapshot deadline (milliseconds)</Text>
      <TextInput
        style={styles.input}
        value={deadlineText}
        onChangeText={updateDeadlineText}
        editable={!busy}
        keyboardType="numeric"
      />
      <Text>
        Identity scenarios change the SDK customer to user_a, user_b or
        anonymous.
      </Text>
      {SCENARIO_BUTTONS.map(({ name, title, testID }) => (
        <ExponeaButton
          key={name}
          title={title}
          testID={testID}
          disabled={busy}
          onPress={() => run(name)}
        />
      ))}
      <Text>
        Happy path and post-login mount warmed content. Lazy invalidate waits
        500ms before fetching again. Timeout uses a 1ms deadline.
      </Text>
      {mounted.map((id) => (
        <View key={`${mountVersion}:${id}`}>
          <Text>Placeholder: {id}</Text>
          <InAppContentBlocksPlaceholder
            placeholderId={id}
            style={styles.placeholder}
            onMessageShown={() => log(`VIEW ${id}: shown`)}
            onNoMessageFound={() => log(`VIEW ${id}: no message found`)}
            onError={(_, __, message) => log(`VIEW ${id}: error ${message}`)}
          />
        </View>
      ))}
      <Text selectable testID={AutomationIds.CB_RUNTIME_STATUS}>
        {logs.join('\n') || 'Runtime controller results will appear here.'}
      </Text>
      <ExponeaButton title="Clear log" onPress={() => setLogs([])} />
      <ExponeaButton
        title="Share log"
        onPress={() => {
          Share.share({
            message: logs.join('\n') || 'No runtime ICB results yet.',
          }).catch((error: unknown) => log(`Share failed: ${String(error)}`));
        }}
      />
    </ExponeaContainer>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#aaa', padding: 8, marginVertical: 8 },
  placeholder: { width: '100%' },
});

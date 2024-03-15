# Sending Push notifications

## Payload constructing
Exponea web app provides great notifications builder, where you can customize all the interaction and how it will be presented to users

1. First open Exponea Web App and choose **Campaigns->Scenarios** from the left menu

  ![](images/send1.png)

2. To create new Campaign, prees **Create new** button

  ![](images/send2.png)

3. This will open a **Campaign Builder** where you can specify when/how your push notification is triggered. You can drag and drop components from the menu and connect triggers to actions. You can find more information on Campaign Builder in [Exponea documentation](https://documentation.bloomreach.com/engagement/docs/scenarios-1).

  ![](images/send3.png)

  ![](images/send4.png)


4. Double-clicking the push notification node will open notification builder. There you can specify **Title (1)** and **Message (2)** for your notification. There is a **Preview (4)** on the right side that will show what the notification is going to look like. Use **platform settings (5)** to preview/set platform for test push notification to either Android or iOS. There is also an option to specify an **Image (6)** you want to display and **Sound (9)** that will be played when notification is received.

> When specifying the sound, provide sound name without extension.

![](images/send5.png)

5. You can also select **Interaction (3)** performed when user opens the notification. There are 3 options available:
  * Open Application
  * Open Browser
  * Open Deeplink

![](images/send6.png)  

6. Additionally you can specify more **Interactions** by Pressing **Add Action button (8)**

![](images/send7.png)

8. Lastly, you can specify additional **Data** you want to send using key-value pairs

![](images/send8.png)

## Sending a test push notification
First you'll need to identify your test user with email address. Run the following code in your app:
``` swift
Exponea.identifyCustomer({}, {email: 'test@test.com'})
```

Then select the user by email in the notification builder preview, select platform and click **Test push notification** button. The push notification should arrive to your device shortly. 

> Keep in mind on **iOS** push notifications only work on a real device, not on Simulator. On Android, push notifications work on an emulator without issues.
package com.exponea.example;

import android.content.Intent;
import android.os.Bundle;
import com.exponea.ExponeaModule;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "example";
  }


  @Override
  protected void onCreate(Bundle savedInstanceState) {
    ExponeaModule.Companion.handleCampaignIntent(getIntent(), getApplicationContext());
    super.onCreate(savedInstanceState);
  }

  @Override
  public void onNewIntent(Intent intent) {
    ExponeaModule.Companion.handleCampaignIntent(intent, getApplicationContext());
    super.onNewIntent(intent);
  }
}

package com.exponea

import android.content.Context
import android.view.View
import android.view.ViewGroup.OnHierarchyChangeListener
import android.widget.Button
import android.widget.ImageView
import android.widget.RelativeLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView.OnChildAttachStateChangeListener
import com.exponea.sdk.models.MessageItem
import com.exponea.sdk.services.DefaultAppInboxProvider
import com.exponea.sdk.view.AppInboxDetailView
import com.exponea.sdk.view.AppInboxListView
import com.exponea.style.AppInboxStyle

class ReactNativeAppInboxProvider(private val appInboxStyle: AppInboxStyle) : DefaultAppInboxProvider() {
    override fun getAppInboxButton(context: Context): Button {
        val button = super.getAppInboxButton(context)
        // Default Button style is set to capitalize text
        button.isAllCaps = false
        appInboxStyle.appInboxButton?.applyTo(button)
        return button
    }

    override fun getAppInboxDetailView(context: Context, messageId: String): View {
        val view = super.getAppInboxDetailView(context, messageId) as AppInboxDetailView
        appInboxStyle.detailView?.let { detailViewStyle ->
            detailViewStyle.applyTo(view)
            detailViewStyle.button?.let { button ->
                // actions may be populated later
                // (performance) register listener only if button style is set
                view.actionsContainerView.setOnHierarchyChangeListener(object : OnHierarchyChangeListener {
                    override fun onChildViewAdded(parent: View?, child: View?) {
                        if (parent != view.actionsContainerView || child == null || child !is Button) {
                            return
                        }
                        button.applyTo(child)
                    }

                    override fun onChildViewRemoved(p0: View?, p1: View?) {
                        // no action
                    }
                })
            }
        }
        return view
    }

    override fun getAppInboxListView(context: Context, onItemClicked: (MessageItem, Int) -> Unit): View {
        val view = super.getAppInboxListView(context, onItemClicked) as AppInboxListView
        appInboxStyle.listView?.applyTo(view)
        appInboxStyle.listView?.list?.item?.let { itemStyle ->
            // items are populated and shown later
            // (performance) register listener only if item style is set
            view.listView.addOnChildAttachStateChangeListener(object : OnChildAttachStateChangeListener {
                override fun onChildViewAttachedToWindow(view: View) {
                    itemStyle.applyTo(ReactNativeMessageItemViewHolder(view))
                }

                override fun onChildViewDetachedFromWindow(view: View) {
                    // nothing to do
                }
            })
        }
        return view
    }

    /**
     * As MessageItemViewHolder from SDK is internal, we need to create mirror.
     */
    class ReactNativeMessageItemViewHolder(target: View) {
        val TODO_REMOVE_ME: RelativeLayout? = target.findViewById(R.id.action_bar_subtitle)
        val itemContainer: RelativeLayout? = target.findViewById(R.id.message_item_container)
        val readFlag: ImageView? = target.findViewById(R.id.message_item_read_flag)
        val receivedTime: TextView? = target.findViewById(R.id.message_item_received_time)
        val title: TextView? = target.findViewById(R.id.message_item_title)
        val content: TextView? = target.findViewById(R.id.message_item_content)
        val image: ImageView? = target.findViewById(R.id.message_item_image)
    }
}

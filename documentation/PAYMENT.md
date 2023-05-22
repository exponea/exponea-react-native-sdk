## 🔍 Payments

Exponea SDK has a convenience method `trackPaymentEvent` to help you track information about a payment for product/service within the application.
```
trackPaymentEvent(params: Record<string, string>): Promise<void>;
```
To support multiple platforms and use-cases, SDK defines Map of values that contains basic information about the purchase.
#### 💻 Usage

```typescript
Exponea.trackPaymentEvent({
      "brutto": "10.0",
      "currency": "USD",
      "payment_system": "CardHolder",
      "item_id": "abcd1234",
      "product_title": "Best product",
      "receipt": "INV_12345"
    });
```

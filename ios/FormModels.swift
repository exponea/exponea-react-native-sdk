import Foundation

// MARK: - Form Request/Response Models
struct FormRequestData: Codable {
  let formId: String
  let values: [String: FormValue]
  let metadata: FormMetadata?

  enum CodingKeys: String, CodingKey {
    case formId = "form_id"
    case values
    case metadata
  }
}

struct FormResponseData: Codable {
  let success: Bool
  let errors: [FormFieldError]?
  let timestamp: Date

  enum CodingKeys: String, CodingKey {
    case success
    case errors
    case timestamp
  }
}

// MARK: - Form Field Models
struct FormValue: Codable {
  let value: AnyCodable
  let type: FormFieldType
  let isValid: Bool

  enum CodingKeys: String, CodingKey {
    case value
    case type = "field_type"
    case isValid = "is_valid"
  }
}

enum FormFieldType: String, Codable {
  case text
  case number
  case email
  case phone
  case date
  case select
  case multiSelect = "multi_select"
  case checkbox
  case custom
}

struct FormFieldError: Codable {
  let fieldId: String
  let errorType: FormErrorType
  let message: String

  enum CodingKeys: String, CodingKey {
    case fieldId = "field_id"
    case errorType = "error_type"
    case message
  }
}

enum FormErrorType: String, Codable {
  case required
  case format
  case length
  case range
  case custom
}

// MARK: - Form Metadata
struct FormMetadata: Codable {
  let version: String
  let platform: String
  let deviceInfo: DeviceInfo
  let sessionId: String?
  let timestamp: Date

  enum CodingKeys: String, CodingKey {
    case version
    case platform
    case deviceInfo = "device_info"
    case sessionId = "session_id"
    case timestamp
  }
}

struct DeviceInfo: Codable {
  let osVersion: String
  let deviceModel: String
  let screenSize: String
  let locale: String

  enum CodingKeys: String, CodingKey {
    case osVersion = "os_version"
    case deviceModel = "device_model"
    case screenSize = "screen_size"
    case locale
  }
}

// MARK: - Form Configuration Models
struct FormFieldConfiguration: Codable {
  let id: String
  let type: FormFieldType
  let label: String
  let placeholder: String?
  let isRequired: Bool
  let validation: FormValidation?
  let defaultValue: AnyCodable?
  let options: [FormFieldOption]?

  enum CodingKeys: String, CodingKey {
    case id
    case type = "field_type"
    case label
    case placeholder
    case isRequired = "required"
    case validation
    case defaultValue = "default_value"
    case options
  }
}

struct FormValidation: Codable {
  let minLength: Int?
  let maxLength: Int?
  let pattern: String?
  let customRule: String?
  let errorMessage: String?

  enum CodingKeys: String, CodingKey {
    case minLength = "min_length"
    case maxLength = "max_length"
    case pattern
    case customRule = "custom_rule"
    case errorMessage = "error_message"
  }
}

struct FormFieldOption: Codable {
  let value: String
  let label: String
  let isDefault: Bool?

  enum CodingKeys: String, CodingKey {
    case value
    case label
    case isDefault = "is_default"
  }
}

// MARK: - Helper for handling dynamic values
struct AnyCodable: Codable {
  let value: Any

  init(_ value: Any) {
    self.value = value
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()

    if let value = try? container.decode(String.self) {
      self.value = value
    } else if let value = try? container.decode(Int.self) {
      self.value = value
    } else if let value = try? container.decode(Double.self) {
      self.value = value
    } else if let value = try? container.decode(Bool.self) {
      self.value = value
    } else if let value = try? container.decode([String: AnyCodable].self) {
      self.value = value
    } else if let value = try? container.decode([AnyCodable].self) {
      self.value = value
    } else {
      self.value = String()
    }
  }

  func encode(to encoder: Encoder) throws {
    var container = encoder.singleValueContainer()

    switch value {
    case let value as String:
      try container.encode(value)
    case let value as Int:
      try container.encode(value)
    case let value as Double:
      try container.encode(value)
    case let value as Bool:
      try container.encode(value)
    case let value as [String: AnyCodable]:
      try container.encode(value)
    case let value as [AnyCodable]:
      try container.encode(value)
    default:
      try container.encode(String(describing: value))
    }
  }
}

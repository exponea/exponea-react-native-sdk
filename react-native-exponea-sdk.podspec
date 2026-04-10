require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-exponea-sdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-exponea-sdk
                   DESC
  s.homepage     = "https://github.com/github_account/react-native-exponea-sdk"
  # brief license entry:
  s.license      = "MIT License"
  s.authors      = { "Exponea" => "contact@exponea.com" }
  s.platforms    = { :ios => "15.1" }
  s.source       = { :git => "https://github.com/github_account/react-native-exponea-sdk.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.exclude_files = ["ios/Tests/*.{h,c,m,mm,swift}", "ios/build/**/*"]
  s.private_header_files = "ios/**/*.h"

  s.dependency "React-Core"
  s.dependency "ExponeaSDK", "3.11.0"
  s.dependency "AnyCodable-FlightSchool", "0.4.0"

  install_modules_dependencies(s)
end

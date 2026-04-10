import UIKit
import ExponeaSDK

@objc(AppInboxButtonView)
public class AppInboxButtonView: UIView {
    private var button: UIButton?
    private var defaultIcon: UIImage?

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupButton()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupButton()
    }

    private func setupButton() {
        // Get the app inbox button from the Exponea SDK
        let appInboxButton = ExponeaSDK.Exponea.shared.getAppInboxButton()

        button = appInboxButton

        // Store the default icon for showIcon toggle
        defaultIcon = appInboxButton.imageView?.image

        // Add button to view hierarchy
        addSubview(appInboxButton)
        appInboxButton.translatesAutoresizingMaskIntoConstraints = false

        // Make button fill the entire view
        NSLayoutConstraint.activate([
            appInboxButton.leadingAnchor.constraint(equalTo: leadingAnchor),
            appInboxButton.trailingAnchor.constraint(equalTo: trailingAnchor),
            appInboxButton.topAnchor.constraint(equalTo: topAnchor),
            appInboxButton.bottomAnchor.constraint(equalTo: bottomAnchor)
        ])
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        button?.frame = bounds
    }

    // MARK: - Styling Properties

    @objc public var textOverride: String? {
        didSet {
            guard let text = textOverride else { return }
            button?.setTitle(text, for: .normal)
        }
    }

    @objc public var textColor: String? {
        didSet {
            guard let color = TypeConverters.parseColor(textColor) else { return }
            button?.setTitleColor(color, for: .normal)
        }
    }

    @objc public var buttonBackgroundColor: String? {
        didSet {
            guard let color = TypeConverters.parseColor(buttonBackgroundColor) else { return }
            button?.backgroundColor = color
        }
    }

    @objc public var textSize: String? {
        didSet {
            guard let size = TypeConverters.parseSize(textSize) else { return }
            if let currentFont = button?.titleLabel?.font {
                let newFont = currentFont.withSize(size)
                button?.titleLabel?.font = newFont
            } else {
                button?.titleLabel?.font = UIFont.systemFont(ofSize: size)
            }
        }
    }

    @objc public var borderRadius: String? {
        didSet {
            guard let radius = TypeConverters.parseSize(borderRadius) else { return }
            button?.layer.cornerRadius = radius
            button?.layer.masksToBounds = true
        }
    }

    @objc public var textWeight: String? {
        didSet {
            let weight = TypeConverters.parseFontWeight(textWeight)
            if let currentFont = button?.titleLabel?.font {
                let newFont = UIFont.systemFont(ofSize: currentFont.pointSize, weight: weight)
                button?.titleLabel?.font = newFont
            } else {
                button?.titleLabel?.font = UIFont.systemFont(ofSize: 17, weight: weight)
            }
        }
    }

    @objc public var showIcon: Bool = true {
        didSet {
            if showIcon {
                button?.setImage(defaultIcon, for: .normal)
            } else {
                button?.setImage(nil, for: .normal)
            }
        }
    }

    @objc public var enabled: Bool = true {
        didSet {
            button?.isEnabled = enabled
            button?.alpha = enabled ? 1.0 : 0.5
        }
    }
}

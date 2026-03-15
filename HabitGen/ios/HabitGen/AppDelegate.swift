import UIKit
import React
import React_RCTAppDelegate
import React_RCTLinking
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  private var pendingShortcutURL: String?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "HabitGen",
      in: window,
      launchOptions: launchOptions
    )

    if let shortcutItem = launchOptions?[.shortcutItem] as? UIApplicationShortcutItem {
      pendingShortcutURL = urlForShortcut(shortcutItem)
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
        self?.openPendingShortcut()
      }
    }

    return true
  }

  func application(
    _ application: UIApplication,
    performActionFor shortcutItem: UIApplicationShortcutItem,
    completionHandler: @escaping (Bool) -> Void
  ) {
    if let urlString = urlForShortcut(shortcutItem),
       let url = URL(string: urlString) {
      RCTLinkingManager.application(application, open: url, options: [:])
    }
    completionHandler(true)
  }

  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  private func urlForShortcut(_ shortcutItem: UIApplicationShortcutItem) -> String? {
    switch shortcutItem.type {
    case "com.starktechstudio.habitgen.dont-uninstall":
      return "habitgen://uninstall-helper"
    default:
      return nil
    }
  }

  private func openPendingShortcut() {
    guard let urlString = pendingShortcutURL,
          let url = URL(string: urlString) else { return }
    pendingShortcutURL = nil
    UIApplication.shared.open(url, options: [:], completionHandler: nil)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

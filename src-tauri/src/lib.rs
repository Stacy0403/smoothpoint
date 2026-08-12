pub mod engine;
pub mod hotkey;
pub mod license;
pub mod overlay;

use engine::Point;
use hotkey::HotkeyState;
use license::LicenseCache;
use overlay::OverlayState;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder,
};

/// Keeps the system tray icon alive for the entire app lifetime.
struct TrayHolder {
    #[allow(dead_code)]
    _tray: TrayIcon,
}

const DEFAULT_COLOR_PRESETS: [&str; 5] =
    ["#FF0000", "#0000FF", "#00AA00", "#FF8800", "#000000"];

#[derive(Default)]
pub struct AppState {
    pub overlay: OverlayState,
    pub hotkeys: HotkeyState,
    pub license: Option<LicenseCache>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmoothRequest {
    pub points: Vec<Point>,
    pub strength: f64,
    pub calligraphy: bool,
}

#[tauri::command]
fn smooth_points(req: SmoothRequest) -> String {
    engine::smooth_stroke(&req.points, req.strength, req.calligraphy)
}

#[tauri::command]
fn set_drawing_mode(state: State<'_, Arc<Mutex<AppState>>>, enabled: bool) {
    state.lock().overlay.drawing_mode = enabled;
}

#[tauri::command]
fn set_click_through(app: AppHandle, enabled: bool) -> Result<(), String> {
    overlay::set_click_through(&app, enabled)
}

#[tauri::command]
fn get_license_cache(state: State<'_, Arc<Mutex<AppState>>>) -> Option<LicenseCache> {
    state.lock().license.clone()
}

#[tauri::command]
fn set_license_cache(
    state: State<'_, Arc<Mutex<AppState>>>,
    license: LicenseCache,
    app: AppHandle,
) {
    state.lock().license = Some(license.clone());
    let _ = app.emit("license_updated", license);
}

#[tauri::command]
fn register_hotkeys(
    app: AppHandle,
    state: State<'_, Arc<Mutex<AppState>>>,
    color_presets: Vec<String>,
) -> Result<(), String> {
    hotkey::register_all(&app, state.inner().clone(), color_presets)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Arc::new(Mutex::new(AppState::default())))
        .setup(|app| {
            let tray = setup_tray(app.handle())?;
            app.manage(TrayHolder { _tray: tray });

            if let Some(window) = app.get_webview_window("overlay") {
                let _ = window.set_ignore_cursor_events(true);
            }

            if let Some(settings) = app.get_webview_window("settings") {
                let _ = settings.show();
                let _ = settings.set_focus();
            }

            let state = app.state::<Arc<Mutex<AppState>>>();
            hotkey::register_all(
                app.handle(),
                state.inner().clone(),
                DEFAULT_COLOR_PRESETS
                    .iter()
                    .map(|c| (*c).to_string())
                    .collect(),
            )?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            smooth_points,
            set_drawing_mode,
            set_click_through,
            get_license_cache,
            set_license_cache,
            register_hotkeys,
        ])
        .run(tauri::generate_context!())
        .expect("error while running SmoothPoint");
}

fn setup_overlay_window(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if app.get_webview_window("overlay").is_some() {
        return Ok(());
    }

    WebviewWindowBuilder::new(app, "overlay", WebviewUrl::App("index.html".into()))
        .title("SmoothPoint")
        .transparent(true)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .build()?;

    Ok(())
}

fn setup_tray(app: &AppHandle) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    let start = MenuItem::with_id(app, "start_drawing", "판서 시작", true, None::<&str>)?;
    let stop = MenuItem::with_id(app, "stop_drawing", "판서 종료", true, None::<&str>)?;
    let click_through =
        MenuItem::with_id(app, "click_through", "Click-Through", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "설정", true, None::<&str>)?;
    let dashboard = MenuItem::with_id(app, "dashboard", "웹 대시보드", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&start, &stop, &click_through, &settings, &dashboard, &quit],
    )?;

    let mut tray_builder = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("SmoothPoint");

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    let tray = tray_builder
        .on_menu_event(|app, event| match event.id.as_ref() {
            "start_drawing" => {
                let _ = app.emit("toggle_drawing", ());
                let _ = set_click_through(app.clone(), false);
            }
            "stop_drawing" => {
                let _ = app.emit("toggle_drawing", ());
                let _ = set_click_through(app.clone(), true);
            }
            "click_through" => {
                let _ = set_click_through(app.clone(), true);
            }
            "settings" => {
                if let Some(w) = app.get_webview_window("settings") {
                    let _ = w.show();
                    let _ = w.set_focus();
                } else {
                    let _ = WebviewWindowBuilder::new(
                        app,
                        "settings",
                        WebviewUrl::App("index.html?window=settings".into()),
                    )
                    .title("SmoothPoint Settings")
                    .inner_size(520.0, 640.0)
                    .center()
                    .build();
                }
            }
            "dashboard" => {
                use tauri_plugin_shell::ShellExt;
                let _ = app.shell().open("http://localhost:3000/dashboard", None);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(w) = app.get_webview_window("settings") {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(tray)
}

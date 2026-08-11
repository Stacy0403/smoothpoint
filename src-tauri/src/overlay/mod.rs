use tauri::{AppHandle, Manager};

#[derive(Default)]
pub struct OverlayState {
    pub drawing_mode: bool,
    pub click_through: bool,
}

pub fn set_click_through(app: &AppHandle, enabled: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("overlay") {
        window
            .set_ignore_cursor_events(enabled)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

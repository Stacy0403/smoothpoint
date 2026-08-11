use crate::engine::Point;
use crate::AppState;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[derive(Default)]
pub struct HotkeyState {
    pub pen_color: String,
    pub pen_width: u32,
    pub color_presets: Vec<String>,
}

pub fn register_all(
    app: &AppHandle,
    state: &State<'_, Arc<Mutex<AppState>>>,
    color_presets: Vec<String>,
) -> Result<(), String> {
    {
        let mut s = state.lock();
        s.hotkeys.color_presets = color_presets.clone();
        s.hotkeys.pen_color = color_presets
            .first()
            .cloned()
            .unwrap_or_else(|| "#FF0000".to_string());
        s.hotkeys.pen_width = 4;
    }

    let gs = app.global_shortcut();
    let _ = gs.unregister_all();

    let state_clone = state.inner().clone();

    // Shift+D — toggle drawing
    let app_toggle = app.clone();
    register_one(app_toggle, "Shift+D", move || {
        let _ = app_toggle.emit("toggle_drawing", ());
    })?;

    // Shift+Z — undo
    let app_undo = app.clone();
    register_one(app_undo, "Shift+Z", move || {
        let _ = app_undo.emit("undo_stroke", ());
    })?;

    // Shift+Esc — click through
    let app_ct = app.clone();
    register_one(app_ct, "Shift+Escape", move || {
        let _ = crate::overlay::set_click_through(&app_ct, true);
    })?;

    // [ and ] — pen width
    let app_bracket = app.clone();
    let state_bracket = state_clone.clone();
    gs.on_shortcut(
        Shortcut::new(None, Code::BracketLeft),
        move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let mut s = state_bracket.lock();
                if s.hotkeys.pen_width > 1 {
                    s.hotkeys.pen_width -= 1;
                }
                let _ = app_bracket.emit(
                    "pen_changed",
                    PenPayload {
                        color: s.hotkeys.pen_color.clone(),
                        width: s.hotkeys.pen_width,
                    },
                );
            }
        },
    )
    .map_err(|e| e.to_string())?;

    let app_bracket_r = app.clone();
    let state_bracket_r = state_clone.clone();
    gs.on_shortcut(
        Shortcut::new(None, Code::BracketRight),
        move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let mut s = state_bracket_r.lock();
                if s.hotkeys.pen_width < 20 {
                    s.hotkeys.pen_width += 1;
                }
                let _ = app_bracket_r.emit(
                    "pen_changed",
                    PenPayload {
                        color: s.hotkeys.pen_color.clone(),
                        width: s.hotkeys.pen_width,
                    },
                );
            }
        },
    )
    .map_err(|e| e.to_string())?;

    // Shift+1..5 colors
    let digit_codes = [
        Code::Digit1,
        Code::Digit2,
        Code::Digit3,
        Code::Digit4,
        Code::Digit5,
    ];

    for (idx, code) in digit_codes.iter().enumerate() {
        let app_color = app.clone();
        let state_color = state_clone.clone();
        let shortcut = Shortcut::new(Some(Modifiers::SHIFT), *code);

        gs.on_shortcut(shortcut, move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let mut s = state_color.lock();
                if idx < s.hotkeys.color_presets.len() {
                    s.hotkeys.pen_color = s.hotkeys.color_presets[idx].clone();
                    let _ = app_color.emit(
                        "pen_changed",
                        PenPayload {
                            color: s.hotkeys.pen_color.clone(),
                            width: s.hotkeys.pen_width,
                        },
                    );
                }
            }
        })
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn register_one<F>(app: AppHandle, combo: &str, handler: F) -> Result<(), String>
where
    F: Fn() + Send + Sync + 'static,
{
    let shortcut: Shortcut = combo.parse().map_err(|e| e.to_string())?;
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                handler();
            }
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Clone, serde::Serialize)]
struct PenPayload {
    color: String,
    width: u32,
}

// Unused but kept for future cursor tracking
#[allow(dead_code)]
pub fn _track_cursor(_points: &[Point]) {}

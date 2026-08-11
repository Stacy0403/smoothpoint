use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
    pub t: f64,
}

mod catmull_rom;
mod calligraphy;

pub fn smooth_stroke(points: &[Point], strength: f64, calligraphy: bool) -> String {
    if points.len() < 2 {
        return String::new();
    }

    let tension = (strength / 100.0).clamp(0.1, 1.0);
    let smoothed = catmull_rom::catmull_rom_spline(points, tension);

    if calligraphy {
        calligraphy::apply_calligraphy(&smoothed)
    } else {
        catmull_rom::points_to_svg_path(&smoothed)
    }
}

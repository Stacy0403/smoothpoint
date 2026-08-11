use super::catmull_rom;
use super::Point;

pub fn apply_calligraphy(points: &[Point]) -> String {
    if points.len() < 2 {
        return String::new();
    }

    let mut path = format!("M {:.2} {:.2}", points[0].x, points[0].y);

    for i in 1..points.len() {
        let prev = &points[i - 1];
        let curr = &points[i];
        let dx = curr.x - prev.x;
        let dy = curr.y - prev.y;
        let dist = (dx * dx + dy * dy).sqrt();
        let dt = (curr.t - prev.t).max(1.0);
        let speed = dist / dt;

        // Slower strokes get thicker curves via quadratic control offset
        let pressure = (1.0 - (speed / 2.0).min(1.0)).max(0.2);
        let cx = (prev.x + curr.x) / 2.0 + dy * 0.1 * pressure;
        let cy = (prev.y + curr.y) / 2.0 - dx * 0.1 * pressure;

        path.push_str(&format!(" Q {:.2} {:.2}, {:.2} {:.2}", cx, cy, curr.x, curr.y));
    }

    path
}

pub fn _fallback(points: &[Point]) -> String {
    catmull_rom::points_to_svg_path(points)
}

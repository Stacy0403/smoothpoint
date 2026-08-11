use super::Point;

pub fn catmull_rom_spline(points: &[Point], tension: f64) -> Vec<Point> {
    if points.len() < 2 {
        return points.to_vec();
    }
    if points.len() == 2 {
        return points.to_vec();
    }

    let mut result = Vec::new();
    let segments = 8;

    for i in 0..points.len() - 1 {
        let p0 = if i == 0 { &points[0] } else { &points[i - 1] };
        let p1 = &points[i];
        let p2 = &points[i + 1];
        let p3 = if i + 2 < points.len() {
            &points[i + 2]
        } else {
            &points[i + 1]
        };

        for j in 0..segments {
            let t = j as f64 / segments as f64;
            let tt = t * t;
            let ttt = tt * t;

            let x = 0.5
                * ((2.0 * p1.x)
                    + (-p0.x + p2.x) * t * tension
                    + (2.0 * p0.x - 5.0 * p1.x + 4.0 * p2.x - p3.x) * tt * tension
                    + (-p0.x + 3.0 * p1.x - 3.0 * p2.x + p3.x) * ttt * tension);

            let y = 0.5
                * ((2.0 * p1.y)
                    + (-p0.y + p2.y) * t * tension
                    + (2.0 * p0.y - 5.0 * p1.y + 4.0 * p2.y - p3.y) * tt * tension
                    + (-p0.y + 3.0 * p1.y - 3.0 * p2.y + p3.y) * ttt * tension);

            result.push(Point {
                x,
                y,
                t: p1.t + (p2.t - p1.t) * t,
            });
        }
    }

    result.push(points[points.len() - 1].clone());
    result
}

pub fn points_to_svg_path(points: &[Point]) -> String {
    if points.is_empty() {
        return String::new();
    }
    let mut path = format!("M {:.2} {:.2}", points[0].x, points[0].y);
    for p in &points[1..] {
        path.push_str(&format!(" L {:.2} {:.2}", p.x, p.y));
    }
    path
}

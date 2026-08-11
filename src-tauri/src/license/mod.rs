use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseCache {
    pub user_id: String,
    pub plan_type: String,
    pub features: Vec<String>,
    pub watermark: serde_json::Value,
    pub organization: Option<serde_json::Value>,
    pub cached_at: String,
}

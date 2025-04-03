const pool = require("../config/database");

/**
 * Creates a new notification in the database
 * @param {Object} notificationData - Notification data including recipient, type, and message
 * @returns {Promise<number>} - The ID of the newly created notification
 */
async function createNotification(notificationData) {
  const [result] = await pool.execute(
    `INSERT INTO notifications (
      recipient_id, recipient_type, type, title,
      message, priority, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      notificationData.recipientId,
      notificationData.recipientType,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.priority || "medium",
      notificationData.status || "pending",
    ]
  );
  return result.insertId;
}

/**
 * Finds a notification by its ID
 * @param {number} id - The notification ID to search for
 * @returns {Promise<Object|null>} - The notification object or null if not found
 */
async function findNotificationById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM notifications WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

/**
 * Retrieves all notifications with optional filters
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} - Array of notification objects
 */
async function findAllNotifications(filters = {}) {
  let query = "SELECT * FROM notifications WHERE 1=1";
  const params = [];

  if (filters.recipientId) {
    query += " AND recipient_id = ?";
    params.push(filters.recipientId);
  }

  if (filters.recipientType) {
    query += " AND recipient_type = ?";
    params.push(filters.recipientType);
  }

  if (filters.type) {
    query += " AND type = ?";
    params.push(filters.type);
  }

  if (filters.priority) {
    query += " AND priority = ?";
    params.push(filters.priority);
  }

  if (filters.status) {
    query += " AND status = ?";
    params.push(filters.status);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await pool.execute(query, params);
  return rows;
}

/**
 * Updates a notification's information
 * @param {number} id - The ID of the notification to update
 * @param {Object} updates - The fields to update and their new values
 * @returns {Promise<void>}
 */
async function updateNotification(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  values.push(id);
  await pool.execute(
    `UPDATE notifications SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Marks a notification as read
 * @param {number} id - The ID of the notification to mark as read
 * @returns {Promise<void>}
 */
async function markNotificationAsRead(id) {
  await pool.execute(
    "UPDATE notifications SET status = 'read', read_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
}

/**
 * Gets a summary of notifications
 * @returns {Promise<Object>} - Summary object with counts by type and status
 */
async function getNotificationSummary() {
  const [summary] = await pool.execute(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN type = 'payment-reminder' THEN 1 ELSE 0 END) as payment_reminders,
      SUM(CASE WHEN type = 'payment-overdue' THEN 1 ELSE 0 END) as payment_overdue,
      SUM(CASE WHEN type = 'incident-report' THEN 1 ELSE 0 END) as incident_reports,
      SUM(CASE WHEN type = 'attendance-update' THEN 1 ELSE 0 END) as attendance_updates,
      SUM(CASE WHEN type = 'system-alert' THEN 1 ELSE 0 END) as system_alerts,
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
      SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
      SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low_priority,
      SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_count,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
    FROM notifications
  `);
  return summary[0];
}

// Export all functions
module.exports = {
  createNotification,
  findNotificationById,
  findAllNotifications,
  updateNotification,
  markNotificationAsRead,
  getNotificationSummary,
};

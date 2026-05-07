# app/core/email_templates.py
"""
Professional HTML email templates for Family Expense notifications.
"""


def _base_layout(content: str, footer_text: str = "") -> str:
    """Wrap content in a consistent email layout."""
    return f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f0f4f8; font-family: 'Segoe UI', Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8; padding:32px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                           style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding:28px 32px; text-align:center;">
                                <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.5px;">
                                    💰 Family Expense Manager
                                </h1>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:32px;">
                                {content}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0; text-align:center;">
                                <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.5;">
                                    {footer_text if footer_text else "Email này được gửi tự động từ hệ thống Family Expense Manager."}
                                    <br>Vui lòng không trả lời email này.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def budget_exceeded_user_template(
    user_name: str,
    category_name: str,
    current_total: str,
    budget_amount: str,
    month: int,
    year: int,
) -> str:
    """Email template when a user exceeds their budget."""
    content = f"""
    <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#fef2f2; border-radius:50%; width:64px; height:64px; line-height:64px; font-size:32px;">⚠️</span>
    </div>
    <h2 style="color:#dc2626; text-align:center; margin:0 0 8px;">Cảnh báo vượt ngân sách!</h2>
    <p style="color:#64748b; text-align:center; margin:0 0 24px; font-size:14px;">Tháng {month}/{year}</p>
    
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Xin chào <strong>{user_name}</strong>,
    </p>
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Tổng chi tiêu của bạn tại danh mục <strong style="color:#4f46e5;">"{category_name}"</strong> 
        đã <strong style="color:#dc2626;">vượt quá ngân sách</strong> được phân bổ.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
           style="background-color:#fef2f2; border-radius:8px; border-left:4px solid #dc2626; margin:20px 0; padding:0;">
        <tr>
            <td style="padding:16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Ngân sách phân bổ:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{budget_amount}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Tổng đã chi tiêu:</td>
                        <td style="color:#dc2626; font-size:15px; font-weight:700; text-align:right; padding:4px 0;">{current_total}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color:#334155; font-size:14px; line-height:1.6;">
        Bạn nên xem xét lại chi tiêu hoặc gửi yêu cầu tăng ngân sách đến Quản trị viên.
    </p>
    """
    return _base_layout(content)


def budget_exceeded_admin_template(
    admin_name: str,
    member_name: str,
    category_name: str,
    current_total: str,
    budget_amount: str,
    month: int,
    year: int,
) -> str:
    """Email template sent to admin when a member exceeds budget."""
    content = f"""
    <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#fef2f2; border-radius:50%; width:64px; height:64px; line-height:64px; font-size:32px;">🔔</span>
    </div>
    <h2 style="color:#dc2626; text-align:center; margin:0 0 8px;">Thành viên vượt ngân sách</h2>
    <p style="color:#64748b; text-align:center; margin:0 0 24px; font-size:14px;">Tháng {month}/{year}</p>
    
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Xin chào <strong>{admin_name}</strong>,
    </p>
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Thành viên <strong style="color:#4f46e5;">{member_name}</strong> đã vượt ngân sách danh mục 
        <strong>"{category_name}"</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
           style="background-color:#fff7ed; border-radius:8px; border-left:4px solid #f59e0b; margin:20px 0;">
        <tr>
            <td style="padding:16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Thành viên:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{member_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Danh mục:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{category_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Ngân sách:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{budget_amount}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Đã chi tiêu:</td>
                        <td style="color:#dc2626; font-size:15px; font-weight:700; text-align:right; padding:4px 0;">{current_total}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color:#334155; font-size:14px; line-height:1.6;">
        Vui lòng đăng nhập hệ thống để xem chi tiết và có biện pháp xử lý phù hợp.
    </p>
    """
    return _base_layout(content)


def budget_request_admin_template(
    admin_name: str,
    requester_name: str,
    category_name: str,
    current_budget: str,
    requested_amount: str,
    month: int,
    year: int,
) -> str:
    """Email template sent to admin for a budget increase request."""
    content = f"""
    <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#eff6ff; border-radius:50%; width:64px; height:64px; line-height:64px; font-size:32px;">📋</span>
    </div>
    <h2 style="color:#1d4ed8; text-align:center; margin:0 0 8px;">Yêu cầu tăng ngân sách mới</h2>
    <p style="color:#64748b; text-align:center; margin:0 0 24px; font-size:14px;">Cần phê duyệt</p>
    
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Xin chào <strong>{admin_name}</strong>,
    </p>
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Thành viên <strong style="color:#4f46e5;">{requester_name}</strong> đã gửi yêu cầu tăng ngân sách.
        Vui lòng xem xét và phê duyệt.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
           style="background-color:#eff6ff; border-radius:8px; border-left:4px solid #3b82f6; margin:20px 0;">
        <tr>
            <td style="padding:16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:6px 0;">Người yêu cầu:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:6px 0;">{requester_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:6px 0;">Danh mục:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:6px 0;">{category_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:6px 0;">Thời gian:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:6px 0;">Tháng {month}/{year}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:6px 0;">Ngân sách hiện tại:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:6px 0;">{current_budget}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:6px 0;">Số tiền yêu cầu thêm:</td>
                        <td style="color:#1d4ed8; font-size:15px; font-weight:700; text-align:right; padding:6px 0;">{requested_amount}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color:#334155; font-size:14px; line-height:1.6;">
        Vui lòng đăng nhập hệ thống để <strong>phê duyệt</strong> hoặc <strong>từ chối</strong> yêu cầu này.
    </p>
    """
    return _base_layout(content)


def budget_approved_template(
    user_name: str,
    category_name: str,
    added_amount: str,
    month: int,
    year: int,
) -> str:
    """Email template sent to member when their budget request is approved."""
    content = f"""
    <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#f0fdf4; border-radius:50%; width:64px; height:64px; line-height:64px; font-size:32px;">✅</span>
    </div>
    <h2 style="color:#16a34a; text-align:center; margin:0 0 8px;">Yêu cầu ngân sách đã được duyệt!</h2>
    <p style="color:#64748b; text-align:center; margin:0 0 24px; font-size:14px;">Tháng {month}/{year}</p>
    
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Xin chào <strong>{user_name}</strong>,
    </p>
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Yêu cầu tăng ngân sách của bạn đã được <strong style="color:#16a34a;">PHÊ DUYỆT</strong> bởi Quản trị viên.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
           style="background-color:#f0fdf4; border-radius:8px; border-left:4px solid #22c55e; margin:20px 0;">
        <tr>
            <td style="padding:16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Danh mục:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{category_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Ngân sách được tăng thêm:</td>
                        <td style="color:#16a34a; font-size:15px; font-weight:700; text-align:right; padding:4px 0;">+{added_amount}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color:#334155; font-size:14px; line-height:1.6;">
        Ngân sách mới đã được cập nhật vào hệ thống. Hãy quản lý chi tiêu hiệu quả nhé!
    </p>
    """
    return _base_layout(content)


def budget_denied_template(
    user_name: str,
    category_name: str,
    requested_amount: str,
    month: int,
    year: int,
) -> str:
    """Email template sent to member when their budget request is denied."""
    content = f"""
    <div style="text-align:center; margin-bottom:24px;">
        <span style="display:inline-block; background-color:#fef2f2; border-radius:50%; width:64px; height:64px; line-height:64px; font-size:32px;">❌</span>
    </div>
    <h2 style="color:#dc2626; text-align:center; margin:0 0 8px;">Yêu cầu ngân sách bị từ chối</h2>
    <p style="color:#64748b; text-align:center; margin:0 0 24px; font-size:14px;">Tháng {month}/{year}</p>
    
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Xin chào <strong>{user_name}</strong>,
    </p>
    <p style="color:#334155; font-size:15px; line-height:1.6;">
        Yêu cầu tăng ngân sách của bạn cho danh mục <strong style="color:#4f46e5;">"{category_name}"</strong> 
        đã bị <strong style="color:#dc2626;">TỪ CHỐI</strong> bởi Quản trị viên.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" 
           style="background-color:#fef2f2; border-radius:8px; border-left:4px solid #ef4444; margin:20px 0;">
        <tr>
            <td style="padding:16px 20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Danh mục:</td>
                        <td style="color:#334155; font-size:15px; font-weight:600; text-align:right; padding:4px 0;">{category_name}</td>
                    </tr>
                    <tr>
                        <td style="color:#64748b; font-size:13px; padding:4px 0;">Số tiền yêu cầu:</td>
                        <td style="color:#dc2626; font-size:15px; font-weight:700; text-align:right; padding:4px 0;">{requested_amount}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color:#334155; font-size:14px; line-height:1.6;">
        Vui lòng xem lại ngân sách hiện tại và điều chỉnh chi tiêu cho phù hợp.
        Bạn có thể liên hệ Quản trị viên để biết thêm chi tiết.
    </p>
    """
    return _base_layout(content)

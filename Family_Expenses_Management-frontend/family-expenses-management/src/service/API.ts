// Bỏ import axios và apiUrl vì chúng ta không cần gọi mạng nữa
import axios from 'axios'
import apiUrl from './apiUrl'

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
const mockCategories = [
  { id: 1, name: "Ăn uống", value: 5000000 },
  { id: 2, name: "Di chuyển", value: 1000000 },
  { id: 3, name: "Giải trí", value: 2000000 },
];

const mockMembers = [
  { id: 1, name: "Bố", amount: 15000000, role: "admin" },
  { id: 2, name: "Mẹ", amount: 12000000, role: "member" },
];

const mockExpenses = [
  { id: 1, name: "Siêu thị Winmart", amount: 450000, category: "Ăn uống", member: "Mẹ", date_str: "2024-03-20" },
  { id: 2, name: "Tiền điện tháng 3", amount: 1200000, category: "Hóa đơn", member: "Bố", date_str: "2024-03-18" },
  { id: 3, name: "Thay nhớt xe", amount: 250000, category: "Di chuyển", member: "Con trai", date_str: "2024-03-15" },
  { id: 4, name: "Mua sách giáo khoa", amount: 300000, category: "Giáo dục", member: "Con gái", date_str: "2024-03-10" },
  { id: 5, name: "Đi ăn Pizza", amount: 600000, category: "Ăn uống", member: "Cả nhà", date_str: "2024-03-22" },
];

// Hàm tiện ích tạo delay giả lập mạng chậm (tùy chọn, để giao diện có hiệu ứng loading)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- CÁC HÀM API GIẢ LẬP ---

export async function Login(username: string, password: string) {
    // Sử dụng URLSearchParams để gửi dữ liệu dạng Form
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await axios.post(
        `${apiUrl}/auth/login`,
        params, // Gửi params thay vì object {}
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        }
    );
    return response;
}

export async function RegisterUser(
    username: string, 
    email: string, 
    password: string,
    fullName: string,
    specificRoles: string
) {
    const params = new URLSearchParams();
    params.append('fullname', fullName.trim());
    params.append('username', username.trim());
    params.append('email', email.trim());
    params.append('password', password);
    params.append('role', 'admin'); // Hoặc logic role của bạn
    params.append('specific_role', specificRoles);

    return await axios.post(`${apiUrl}/auth/register`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    });
}
export async function VerifyEmail(email: string, otp: string) {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('otp', otp);

    return await axios.post(`${apiUrl}/auth/verify-email`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    });
}

// 4. ĐỔI MẬT KHẨU (Change Password)
export async function ChangePassword(currentPassword: string, newPassword: string) {
    const access_token = localStorage.getItem("access_token");
    const response = await axios.put(
        `${apiUrl}/auth/change-password`,
        new URLSearchParams({
            current_password: currentPassword,
            new_password: newPassword,
        }),
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );
    return response
}

// 5. QUÊN MẬT KHẨU (Forgot Password)
export async function ForgotPassword(email: string) {
    const data = new URLSearchParams();
    data.append('email', email);
    const response = await axios.post(
        `${apiUrl}/auth/forget-password`,
        data.toString(), 
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
        }
    );
    return response
}


export async function Logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("family_id");
    localStorage.removeItem("user_id");
}

export async function GetFamilyData() {
    await delay(500);
    return { 
        status: 200, 
        data: {
            totalBudget: 30000000,
            totalSpent: 8000000,
            categoryData: mockCategories,
            memberData: mockMembers,
            recentExpenses: mockExpenses
        } 
    };
}
// service/API.ts

// service/API.ts

export async function AdminRegisterUser(
  username: string,
  email: string,
  password: string,
  fullName: string,
  specificRole: string,
  role: string
) {
  const access_token = localStorage.getItem("access_token");
  const params = new URLSearchParams();
  
  // Phải khớp chính xác key với Form(...) ở Backend
  params.append('fullname', fullName); 
  params.append('username', username);
  params.append('email', email);
  params.append('password', password);
  params.append('role', role);
  params.append('specific_role', specificRole);

  return await axios.post(`${apiUrl}/users/add_members`, params, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
  });
}

// Thêm hàm xóa thành viên
export async function deleteMemberApi(userId: string) {
    const access_token = localStorage.getItem("access_token");
    return await axios.delete(`${apiUrl}/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
}

// service/API.ts

// 1. LẤY DANH SÁCH DANH MỤC
// Lưu ý: Backend đã đổi prefix thành /expense-categories (có s) 
// và tự lọc theo token nên không cần truyền familyId vào URL nữa.
export async function getCategories() {
    const access_token = localStorage.getItem("access_token");
    return await axios.get(`${apiUrl}/expense-categories/`, {
        headers: { 
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json'
        }
    });
}

// 2. TẠO DANH MỤC MỚI
export async function CreateCategories(categoryName: string) {
    const access_token = localStorage.getItem("access_token");
    const params = new URLSearchParams();
    params.append('name', categoryName); // Backend dùng Form(...) nên phải dùng URLSearchParams

    return await axios.post(`${apiUrl}/expense-categories/`, params, {
        headers: { 
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });
}

// 3. CẬP NHẬT DANH MỤC
export async function updateCategoryApi(id: string, newName: string) {
    const access_token = localStorage.getItem("access_token");
    const params = new URLSearchParams();
    params.append('name', newName);

    return await axios.put(`${apiUrl}/expense-categories/${id}`, params, {
        headers: { 
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });
}

// 4. XÓA DANH MỤC
export async function deleteCategoryApi(id: string) {
    const access_token = localStorage.getItem("access_token");
    return await axios.delete(`${apiUrl}/expense-categories/${id}`, {
        headers: { 
            'Authorization': `Bearer ${access_token}` 
        }
    });
}
export async function getMemberFamily() {
    const access_token = localStorage.getItem("access_token")
    const response = await axios.get(`
    ${apiUrl}/users/family`,
    {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${access_token}`,
        }
    })
    return response
}

export async function getMemberData() {
    await delay(500);
    return { 
        status: 200, 
        data: {
            // Dashboard dùng Object.entries nên key phải là tên Member
            members: {
                "Bố": {
                    totalBudget: 15000000,
                    totalSpent: 4000000,
                    categoryData: mockCategories,
                    recentExpenses: mockExpenses
                },
                "Mẹ": {
                    totalBudget: 15000000,
                    totalSpent: 2500000,
                    categoryData: mockCategories,
                    recentExpenses: mockExpenses
                }
            }
        } 
    };
}


// Helper để lấy token
const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
};


export async function CreateFamilyNames(familyName: string) {
    return await axios.post(`${apiUrl}/family/create`, // Thêm /create vào đây
        new URLSearchParams({ name: familyName }), // Backend đang dùng Form(...)
        { 
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded' 
            } 
        }
    );
}

// 4. GET EXPENSES (Lấy từ DB thật)
export async function getExpenses() {
    const familyId = localStorage.getItem("family_id");
    return await axios.get(`${apiUrl}/expense/family/${familyId}`, {
        headers: getAuthHeader()
    });
}
export async function ActivateAccount(token: string) {
    return await axios.get(`${apiUrl}/auth/activate?token=${token}`, {
        headers: { 'Accept': 'application/json' }
    });
}

export async function updateMemberApi(userId: string, updateData: { fullname?: string, role?: string, specific_role?: string }) {
    const access_token = localStorage.getItem("access_token");
    const params = new URLSearchParams();
    if (updateData.fullname) params.append('fullname', updateData.fullname);
    if (updateData.role) params.append('role', updateData.role);
    if (updateData.specific_role) params.append('specific_role', updateData.specific_role);

    return await axios.put(`${apiUrl}/users/${userId}`, params, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}
export async function GetMe() {
    const access_token = localStorage.getItem("access_token");
    return await axios.get(`${apiUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
}

export async function GetFamilyDetail() {
    const access_token = localStorage.getItem("access_token");
    return await axios.get(`${apiUrl}/family/detail`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
}

// Rời khỏi gia đình (Dành cho thành viên)
export async function LeaveFamily() {
    const access_token = localStorage.getItem("access_token");
    return await axios.post(`${apiUrl}/family/leave`, {}, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
}
export async function AcceptFamilyInvite(token: string) {
    const access_token = localStorage.getItem("access_token");
    return await axios.post(`${apiUrl}/users/accept-invite`, 
        new URLSearchParams({ token: token }), 
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
}
// 5. GET BUDGETS
export async function getBudgets() {
    const familyId = localStorage.getItem("family_id");
    // Giả sử backend có endpoint lấy budget theo family
    return await axios.get(`${apiUrl}/budget/family/${familyId}`, {
        headers: getAuthHeader()
    });
}
export async function acceptInviteApi(token: string) {
    const access_token = localStorage.getItem("access_token");
    return await axios.post(`${apiUrl}/users/accept-invite`, 
        new URLSearchParams({ token: token }), 
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
}
export async function inviteMemberViaEmail (email: string, role: string) {
    const access_token = localStorage.getItem("access_token");
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('role', role);

    return await axios.post(`${apiUrl}/users/invite_only`, params, {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

// 6. CREATE EXPENSE (Thêm chi tiêu mới)
export async function createNewExpenses(expenseData: any) {
    return await axios.post(`${apiUrl}/expense/`, expenseData, {
        headers: getAuthHeader()
    });
}

// 7. DELETE EXPENSE
export async function deleteExpense(id: string) {
    return await axios.delete(`${apiUrl}/expense/${id}`, {
        headers: getAuthHeader()
    });
}




export async function updateExpense() {
    await delay(300);
    return { status: 200, data: { message: "Cập nhật chi tiêu thành công" } };
}

export async function updateCategoy() {
    await delay(300);
    return { status: 200, data: { message: "Cập nhật danh mục thành công" } };
}

export async function adminAddBudget() {
    await delay(300);
    return { status: 201, data: { message: "Thêm ngân sách thành công" } };
}



export async function UpdateBudget() {
    await delay(300);
    return { status: 200, data: { message: "Cập nhật ngân sách thành công" } };
}
  
export async function deleteBudget() {
    await delay(300);
    return { status: 200, data: { message: "Xóa ngân sách thành công" } };
}

export async function RequestBudget() {
    await delay(400);
    return { status: 201, data: { message: "Yêu cầu ngân sách thành công" } };
}

export async function GetMonthlyData() {
    await delay(500);
    return { 
        status: 200, 
        data: [
            { month: "T1", expense: 12000000, budget: 15000000 },
            { month: "T2", expense: 15000000, budget: 15000000 },
            { month: "T3", expense: 9000000, budget: 15000000 },
        ] 
    };
}



export async function BugetPending() {
    await delay(400);
    return { 
        status: 200, 
        data: [
            { id: 1, category_name: "Giải trí", requested_amount: 500000, user_name: "Mẹ", status: "pending" }
        ] 
    };
}

export async function ApproveBudget() {
    await delay(300);
    return { status: 200, data: { message: "Đã duyệt" } };
}

export async function RejectBudget() {
    await delay(300);
    return { status: 200, data: { message: "Đã từ chối" } };
}


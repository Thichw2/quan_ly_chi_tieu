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

export async function CreateFamilyNames(familyName: string) {
    await delay(500);
    return { status: 201, data: { message: "Tạo gia đình thành công", name: familyName } };
}

export async function CreateCategories(category: string) {
    await delay(300);
    return { status: 201, data: { message: "Tạo danh mục thành công" } };
}

export async function AdminRegisterUser() {
    await delay(500);
    return { status: 201, data: { message: "Thêm thành viên thành công" } };
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

export async function getMemberFamily() {
    await delay(300);
    return { status: 200, data: mockMembers };
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

export async function getBudgets() {
    await delay(400);
    return { 
        status: 200, 
        data: [
            { id: 1, category_id: 1, amount: 10000000, month: "10", year: "2023" }
        ] 
    };
}

export async function getExpenses() {
    await delay(400);
    return { status: 200, data: mockExpenses };
}

export async function createNewExpenses() {
    await delay(300);
    return { status: 201, data: { message: "Đã thêm chi tiêu" } };
}

export async function getCategories() {
    await delay(300);
    return { status: 200, data: mockCategories };
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

export async function deleteExpense() {
    await delay(300);
    return { status: 200, data: { message: "Xóa thành công" } };
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


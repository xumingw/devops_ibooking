import { hasLogin, loginStudent } from '../../services/auth';

Page({
  data: {
    studentId: 'stu_cse_01',
    password: 'Pass123!',
    loading: false,
    message: ''
  },
  onLoad() {
    if (hasLogin()) {
      wx.reLaunch({ url: '/pages/home/home' });
    }
  },
  onStudentIdInput(event: { detail: { value: string } }) {
    this.setData({ studentId: event.detail.value });
  },
  onPasswordInput(event: { detail: { value: string } }) {
    this.setData({ password: event.detail.value });
  },
  async onLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true, message: '' });
    try {
      const session = await loginStudent(this.data.studentId.trim(), this.data.password);
      wx.showToast({ title: `欢迎，${session.user.name}`, icon: 'success' });
      wx.reLaunch({ url: '/pages/home/home' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      this.setData({ message });
      wx.showToast({ title: message, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});

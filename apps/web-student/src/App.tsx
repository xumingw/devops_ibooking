import { F } from '@ibooking/design-tokens';

export function App() {
  return (
    <main className="student-shell">
      <section className="student-login">
        <div className="brand-mark">复旦大学</div>
        <h1>自习室预约系统</h1>
        <p>学生端 I0 工程骨架</p>
        <form className="login-form">
          <label>
            学号
            <input placeholder="请输入学号" disabled />
          </label>
          <label>
            密码
            <input placeholder="I1 接入认证" type="password" disabled />
          </label>
          <button type="button" style={{ background: F.navy }} disabled>
            登录
          </button>
        </form>
      </section>
    </main>
  );
}

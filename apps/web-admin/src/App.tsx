import { Button, Card, Form, Input, Typography } from 'antd';

const { Title, Text } = Typography;

export function App() {
  return (
    <main className="admin-shell">
      <Card className="admin-login">
        <Title level={2}>管理端登录</Title>
        <Text type="secondary">I0 工程骨架，认证与 RBAC 将在 I1 接入。</Text>
        <Form layout="vertical" disabled className="admin-form">
          <Form.Item label="账号">
            <Input placeholder="admin_full" />
          </Form.Item>
          <Form.Item label="密码">
            <Input.Password placeholder="I1 接入认证" />
          </Form.Item>
          <Button type="primary" block>
            登录
          </Button>
        </Form>
      </Card>
    </main>
  );
}

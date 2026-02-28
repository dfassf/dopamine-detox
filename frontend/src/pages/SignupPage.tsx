import { type FormEvent, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";
import { signup } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { AxiosError } from "axios";
import { PageHeader, FormField, Button } from "../components/ui";

export default function SignupPage() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!email) e.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "올바른 이메일 형식이 아닙니다";

    if (!password) e.password = "비밀번호를 입력해주세요";
    else if (password.length < 8) e.password = "비밀번호는 8자 이상이어야 합니다";

    if (password !== passwordConfirm)
      e.passwordConfirm = "비밀번호가 일치하지 않습니다";

    const trimmed = nickname.trim();
    if (!trimmed) e.nickname = "닉네임을 입력해주세요";
    else if (trimmed.length < 2 || trimmed.length > 20)
      e.nickname = "닉네임은 2~20자여야 합니다";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await signup(email, password, nickname.trim());
      flushSync(() => {
        loginSuccess(data.access_token, data.user);
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setErrors({ email: "이미 가입된 이메일입니다" });
      }
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    email && password.length >= 8 && password === passwordConfirm && nickname.trim().length >= 2;

  return (
    <div className="screen">
      <PageHeader title="회원가입" onBack variant="auth" />

      <form
        className="screen-content"
        onSubmit={handleSubmit}
        style={{ padding: "8px 24px 32px", display: "flex", flexDirection: "column" }}
      >
        <FormField label="이메일" error={errors.email}>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "error" : ""}
          />
        </FormField>

        <FormField label="비밀번호" error={errors.password}>
          <input
            type="password"
            placeholder="8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "error" : ""}
          />
        </FormField>

        <FormField label="비밀번호 확인" error={errors.passwordConfirm}>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={errors.passwordConfirm ? "error" : ""}
          />
        </FormField>

        <FormField label="닉네임" error={errors.nickname}>
          <input
            type="text"
            placeholder="2~20자"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={errors.nickname ? "error" : ""}
          />
        </FormField>

        <div style={{ flex: 1 }} />

        <div>
          <Button
            type="submit"
            disabled={!isValid}
            loading={loading}
            loadingText="가입 중..."
          >
            가입하기
          </Button>
          <div className="form-link">
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

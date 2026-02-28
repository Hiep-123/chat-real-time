import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { FieldDescription } from "../ui/field";
import { useAuthStore } from "@/stores/useAuthStore";

const signupFormSchema = z.object({
  firstname: z.string().min(1, "Vui lòng nhập tên của bạn"),
  lastname: z.string().min(1, "Vui lòng nhập họ của bạn"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("Địa chỉ email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự")
})

type SignupFormValues = z.infer<typeof signupFormSchema>; // { firstname: string; lastname: string; username: string; email: string; password: string

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema)
  })


  const onsubmit = async (data: SignupFormValues) => {
    const { username, password, email, firstname, lastname } = data;
    await signUp(username, password, email, firstname, lastname);
    navigate("/signin");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onsubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                {/* header - logo */}
                <a href="" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">Tạo tài khoản Chat</h1>
                <p className="text-muted-foreground text-balance"> Chào mừng bạn! Hãy đăng ký để bắt đầu!</p>
              </div>
              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">Họ</Label>
                  <Input
                    type="text"
                    id="lastname"
                    {...register("lastname")}
                  />
                  {/* todo: error message */}
                  {errors.lastname && (
                    <p className="text-sm text-red-600">{errors.lastname.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstname" className="block text-sm">Tên</Label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {/* todo: error message */}
                  {errors.firstname && (
                    <p className="text-sm text-red-600">{errors.firstname.message}</p>
                  )}
                </div>

              </div>
              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">Tên đăng nhập</Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="moji"
                  {...register("username")} />
                {/* todo: error message */}
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">Email</Label>
                <Input
                  type="text"
                  id="email"
                  placeholder="moji"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">Mật khẩu</Label>
                <Input
                  type="text"
                  id="password"
                  placeholder="moji"
                  {...register("password")}
                />
                {/* todo: error message */}
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={isSubmitting}>Tạo tài khoản</Button>
              <div className="text-center text-sm">
                Đã có tài khoản ? {" "}
                <Link to="/signin" className="underline underline-offset-4">Đăng nhập</Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách tiếp tục, bạn đồng ý với  <a href="#">Điều khoản dịch vụ</a> và {" "} <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </FieldDescription>
    </div >
  )
}

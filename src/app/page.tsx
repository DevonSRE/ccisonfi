import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterStartStep } from "@/components/auth/RegisterStartStep";

export default function Home() {
  return (
    <AuthLayout
      title="Select your registration type"
      description="Step 1: Choose whether you are registering as a sponsor or attendee/participant. Sponsors should select sponsorship category and number of staff."
    >
      <RegisterStartStep />
    </AuthLayout>
  );
}

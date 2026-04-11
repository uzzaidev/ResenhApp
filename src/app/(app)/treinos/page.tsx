import { redirect } from "next/navigation";

export default async function TreinosPage() {
  redirect("/eventos?tipo=treino");
}

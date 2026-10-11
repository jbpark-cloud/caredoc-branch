import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db, userFromRequest } from "@/lib/db/server";

/** 회원 탈퇴: 구직자·기업 정보와 로그인 계정 삭제. 이미 시설에 전달된 지원 기록은 개인정보처리방침의 보관기간(1년) 후 파기 */
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ ok: false, msg: "로그인이 필요합니다" }, { status: 401 });
  const c = db()!;
  await c.from("alerts").delete().eq("seeker_id", user.id);
  await c.from("seekers").delete().eq("id", user.id);
  await c.from("businesses").delete().eq("owner_id", user.id); // 공고는 cascade 삭제
  const { error } = await c.auth.admin.deleteUser(user.id);
  revalidateTag("jobs");
  return NextResponse.json({ ok: !error, msg: error ? "계정 삭제 중 문제가 생겼습니다. 고객센터로 알려주세요" : undefined });
}

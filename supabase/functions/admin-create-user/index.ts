import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({error:"Thiếu phiên đăng nhập"}), {status:401,headers:cors});

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const adminClient = createClient(url, serviceKey);
    const userClient = createClient(url, anonKey, {global:{headers:{Authorization:authHeader}}});

    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError || !user) return new Response(JSON.stringify({error:"Phiên đăng nhập không hợp lệ"}),{status:401,headers:cors});

    const {data:caller}=await adminClient.from("profiles").select("role").eq("id",user.id).single();
    if(caller?.role!=="admin") return new Response(JSON.stringify({error:"Chỉ Admin mới được tạo tài khoản"}),{status:403,headers:cors});

    const body=await req.json();
    const {email,password,full_name,role,department}=body;
    if(!email || !password || String(password).length<6) return new Response(JSON.stringify({error:"Email và mật khẩu tối thiểu 6 ký tự là bắt buộc"}),{status:400,headers:cors});
    const allowed=["admin","director","manager","staff"];
    const finalRole=allowed.includes(role)?role:"staff";

    const {data:created,error:createError}=await adminClient.auth.admin.createUser({
      email:String(email).trim(),
      password:String(password),
      email_confirm:true,
      user_metadata:{full_name:full_name||email}
    });
    if(createError) return new Response(JSON.stringify({error:createError.message}),{status:400,headers:cors});

    const {error:profileError}=await adminClient.from("profiles").upsert({
      id:created.user.id,
      full_name:full_name||email,
      role:finalRole,
      department:department||null
    });
    if(profileError){
      await adminClient.auth.admin.deleteUser(created.user.id);
      return new Response(JSON.stringify({error:"Tạo hồ sơ thất bại: "+profileError.message}),{status:500,headers:cors});
    }
    return new Response(JSON.stringify({ok:true,user_id:created.user.id,email:created.user.email}),{status:200,headers:cors});
  } catch(e) {
    return new Response(JSON.stringify({error:e?.message||"Lỗi máy chủ"}),{status:500,headers:cors});
  }
});
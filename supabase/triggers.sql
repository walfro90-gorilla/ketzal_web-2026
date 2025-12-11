DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  normalized_role text;
begin
  -- Normalize Role to match Enum or Defaults
  -- If metadata has 'traveler', allow it. If null, 'traveler'.
  normalized_role := coalesce(new.raw_user_meta_data->>'role', 'traveler');

  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    -- Ensure unique username if collision, or use random valid text
    coalesce(new.raw_user_meta_data->>'username', encode(gen_random_bytes(8), 'hex')), 
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    -- Cast to user_role enum
    normalized_role::public.user_role
  );
  
  insert into public.wallets (user_id, balance)
  values (new.id, 0);

  return new;
exception
  when others then
    -- Log error in Postgres logs, but raise to stop transaction
    raise exception 'Error in handle_new_user: %', SQLERRM;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

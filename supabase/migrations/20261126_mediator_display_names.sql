-- Rename the two mediator display labels without changing their private auth identities.
update public.mediators
set display_name = case display_name
  when 'Sujjet Kumar' then 'Booking Manager'
  when 'MD Kaif' then 'Booking Sahayak'
  else display_name
end
where display_name in ('Sujjet Kumar', 'MD Kaif');

alter table public.mediators
  drop constraint if exists mediators_display_name_check;

alter table public.mediators
  add constraint mediators_display_name_check
  check (display_name in ('Booking Manager', 'Booking Sahayak'));

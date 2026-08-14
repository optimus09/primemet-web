alter table public.scrap_materials add column if not exists image_url text;

update public.scrap_materials set image_url = '/photos/materials/ms-turnings.jpg' where name = 'MS Turnings';
update public.scrap_materials set image_url = '/photos/materials/hms.jpg' where name = 'HMS 1 & 2';
update public.scrap_materials set image_url = '/photos/materials/aluminium.jpg' where name = 'Aluminium';
update public.scrap_materials set image_url = '/photos/materials/copper.jpg' where name = 'Copper';
update public.scrap_materials set image_url = '/photos/materials/ss304.jpg' where name = 'SS 304 / 316';
update public.scrap_materials set image_url = '/photos/materials/brass.jpg' where name = 'Brass & Alloys';

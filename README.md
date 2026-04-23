# Dispo? 🗓️

A simple scheduling app that helps people find a common available time based on participants’ availability.

Try it out [here](https://dispo.la) - it is self hosted !

## How it works
1.	A user creates a poll (represented as a calendar) and shares a link with participants 🔗
2.	Each participant marks their availability on the calendar. ✍️
3.	The most suitable time slots are highlighted based on participant count ⭐

## Why Dispo?
This tool prioritizes ease of use over complexity.
- A clean, minimal UI encourages participation (even from “tool-resistant” teammates)
- No account creation, no password, no onboarding friction 🔗
- Participants open a shared link and submit availability right away

## Features
- Automatic suggestion of upcoming best time slots
- Filling in availabilities for other participants
- Display of time slots in the local timezone, so it works when travelling
- Ability to add common slots to calendar (on Safari or Google Calendar only, due to browser limitations)

### Upcoming features
- Home page with one's recent polls

## Tech Stack
- Frontend: **Svelte**, using AirDatePicker for the calendar and custom wheels for time selection. Translated in three languages using ParaglideJS. 
- Backend: **NestJS**, TypeORM
- Database: **PostgreSQL** 🐘

> In particular, the backend leverages PostgreSQL’s `tsrange` type to efficiently manage availability intervals, allowing accurate detection of overlapping time slots and aggregation across multiple participants.

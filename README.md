# Dispo? 🗓️

A simple scheduling app that helps people find a common available time based on participants’ availability — currently under development 🚧.

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
- Automatic suggestion of best time slots
- Filling in availabilities for other participants
- Display of time slots in the local timezone, so it works when travelling

### Upcoming features
- Merging of contiguous slots
- Only upcoming slots are displayed - suitable for a regular calendar

This project is **currently under active development**. Features, architecture, and user interface are subject to change.

## Tech Stack
- Frontend: Svelte
- Backend: NestJS
- Database: PostgreSQL 🐘

> In particular, the backend leverages PostgreSQL’s `tsrange` type to efficiently manage availability intervals, allowing accurate detection of overlapping time slots and aggregation across multiple participants.

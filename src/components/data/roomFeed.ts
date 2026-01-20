// src/data/roomsFeed.ts

export type RoomName = "Overthinking" | "Anxiety" | "Gratitude" | "Late night";

export type RoomPost = {
  id: number;
  room: RoomName;
  title: string;
  body: string;
  timeAgo: string;
  username: string;
};

export const ROOM_FILTERS = [
  "All",
  "Overthinking",
  "Anxiety",
  "Gratitude",
  "Late night",
] as const;

export type FeedFilter = (typeof ROOM_FILTERS)[number];

export const ROOM_POSTS: RoomPost[] = [
  {
    id: 1,
    room: "Overthinking",
    title: "Fear of dying",
    body: "Just random text but this is where I expect text to go for where the user posts their stuff.",
    timeAgo: "3 hr. ago",
    username: "@user5675",
  },
  {
    id: 2,
    room: "Anxiety",
    title: "Tomorrow’s presentation",
    body: "My hands shake just thinking about standing in front of everyone. I keep rewriting the same slides.",
    timeAgo: "1 hr. ago",
    username: "@nervous_novice",
  },
  {
    id: 3,
    room: "Gratitude",
    title: "Coffee with a friend",
    body: "We only talked for an hour but I left feeling lighter. It reminded me I’m not as alone as I think.",
    timeAgo: "5 hr. ago",
    username: "@softmornings",
  },
  {
    id: 4,
    room: "Late night",
    title: "Scrolling at 2am again",
    body: "I know I should be sleeping but somehow I’m back on my phone instead of closing my eyes.",
    timeAgo: "23 min. ago",
    username: "@nightowl",
  },
  {
    id: 5,
    room: "Overthinking",
    title: "Did I say something wrong?",
    body: "Replaying a tiny comment from earlier and convincing myself everyone secretly hates me for it.",
    timeAgo: "47 min. ago",
    username: "@looping_thoughts",
  },
  {
    id: 6,
    room: "Anxiety",
    title: "Phone calls",
    body: "I stared at my phone for 20 minutes before making a 30-second call. Why is this so hard?",
    timeAgo: "7 hr. ago",
    username: "@call_me_never",
  },
  {
    id: 7,
    room: "Gratitude",
    title: "A quiet walk",
    body: "No headphones, no notifications. Just trees, cold air, and my feet on the pavement. I needed that.",
    timeAgo: "2 hr. ago",
    username: "@present_for_a_minute",
  },
  {
    id: 8,
    room: "Late night",
    title: "The house finally went quiet",
    body: "Everyone’s asleep and it’s the first moment today that actually feels like mine.",
    timeAgo: "4 hr. ago",
    username: "@midnightmind",
  },
  {
    id: 9,
    room: "Overthinking",
    title: "They didn’t reply",
    body: "It’s probably nothing but my brain is inventing a hundred reasons why they suddenly hate me.",
    timeAgo: "9 hr. ago",
    username: "@typing_then_deleting",
  },
  {
    id: 10,
    room: "Anxiety",
    title: "Heart racing for no reason",
    body: "Nothing is wrong but my body is convinced something is. I hate how it sneaks up on me.",
    timeAgo: "36 min. ago",
    username: "@wired_and_tired",
  },
  {
    id: 11,
    room: "Gratitude",
    title: "A small win at work",
    body: "It wasn’t huge, but my manager noticed and said thank you. I’m letting myself feel proud.",
    timeAgo: "1 day ago",
    username: "@slow_progress",
  },
  {
    id: 12,
    room: "Late night",
    title: "Trying to journal instead",
    body: "Instead of doom-scrolling I’m dumping everything here. It feels messy but at least it’s out.",
    timeAgo: "18 min. ago",
    username: "@learning_to_write",
  },
  {
    id: 13,
    room: "Overthinking",
    title: "Replaying old arguments",
    body: "It’s been years but I still come up with new replies I’ll never say out loud.",
    timeAgo: "11 hr. ago",
    username: "@time_traveler",
  },
  {
    id: 14,
    room: "Anxiety",
    title: "Leaving messages on read",
    body: "Sometimes I read a message and need hours before I can answer. It doesn’t mean I don’t care.",
    timeAgo: "52 min. ago",
    username: "@silent_friend",
  },
  {
    id: 15,
    room: "Gratitude",
    title: "Stronger than before",
    body: "Old me would’ve shut down today. New me took a breath, asked for help, and kept going.",
    timeAgo: "3 days ago",
    username: "@quietgrowth",
  },
];

import type { PyqSeedItem } from "./types";
import { posts as posts2021 } from "./jnvst-2021";
import { posts as posts2022 } from "./jnvst-2022";
import { posts as posts2023 } from "./jnvst-2023";
import { posts as posts2024 } from "./jnvst-2024";
import { posts as posts2025 } from "./jnvst-2025";
import { posts as postsJnvst9 } from "./jnvst-class-9";
import { posts as postsAisseeRms9 } from "./aissee-rms-class-9";

export const pyqSeedItems: PyqSeedItem[] = [
  ...posts2021,
  ...posts2022,
  ...posts2023,
  ...posts2024,
  ...posts2025,
  ...postsJnvst9,
  ...postsAisseeRms9,
];

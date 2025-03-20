<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";

  import Discord from "../../assets/logos/discord.svg";
  import Github from "../../assets/logos/github.svg";
  import xlogo from "../../assets/logos/x.svg";
</script>

<a
  href="https://github.com/wosherco/bashbuddy"
  target="_blank"
  rel="noopener noreferrer"
>
  <img src={Github} width="20" height="20" alt="Github Repo" />
</a>

<a
  href="https://discord.com/invite/knDFUB5UtU"
  target="_blank"
  rel="noopener noreferrer"
>
  <img src={Discord} width="24" height="18" alt="Discord Community" />
</a>

<a href="https://x.com/wosherco" target="_blank" rel="noopener noreferrer">
  <img src={xlogo} width="20" height="20" alt={m.footer_x_alt()} />
</a>

<script lang="ts">
  import Socials from "$lib/components/Socials.svelte";
  import * as m from "$lib/paraglide/messages.js";

  const year = new Date().getFullYear();
</script>

<footer class="mt-10 bg-black text-white">
  <div class="mx-auto flex max-w-screen-xl justify-between gap-4 p-16">
    <p>
      {m.footer_created_by()}{" "}
      <a
        class="hover:underline"
        href="https://polv.dev"
        target="_blank"
        rel="noopener noreferrer"
      >
        Pol Vallverdu
      </a>
    </p>
    <div class="flex flex-row items-center gap-4">
      <Socials />
      <p>
        © {year}{" "}
        <a
          class="hover:underline"
          href="https://wosher.co"
          target="_blank"
          rel="noopener noreferrer"
        >
          wosher.co
        </a>
        . {m.footer_rights()}
      </p>
    </div>
  </div>
</footer>

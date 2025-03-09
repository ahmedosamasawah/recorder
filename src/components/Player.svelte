{#if audioBlob}
    <audio controls>
        <source src={audioSrc} type="audio/mp4" />
    </audio>
{/if}

<script lang="ts">
export let audioBlob

let audioSrc: string | null = null

$: if (audioBlob) {
    audioSrc = URL.createObjectURL(audioBlob)
}
</script>

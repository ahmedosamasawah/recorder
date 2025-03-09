<section>
    <h2>التسجيلات السابقة</h2>
    {#each recordings as rec (rec.id)}
        <div class="recording-item">
            <audio controls>
                <source src={URL.createObjectURL(rec.blob)} type="audio/mp4" />
            </audio>
            <span>{rec.duration}s</span>
            <button on:click={() => handleDelete(rec.id)}>🗑 حذف</button>
        </div>
    {/each}
</section>

<script lang="ts">
export let recordings
export let fetchRecordings

import {deleteRecording} from '../lib/StorageService.ts'

fetchRecordings()

const handleDelete = async (id: string) => {
    await deleteRecording(id)
    await fetchRecordings()
}
</script>

<style>
.recording-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}
</style>

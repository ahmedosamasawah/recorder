<section>
    <h2>التسجيلات السابقة</h2>
    {#each recordings as recording (recording.id)}
        <div class="recording-item">
            <audio controls>
                <source src={URL.createObjectURL(recording.blob)} type="audio/mp4" />
            </audio>
            <span>{getTimeAgo(recording.timestamp)}</span>
            <button on:click={() => handleDelete(recording.id)}>🗑 حذف</button>
        </div>
    {/each}
</section>

<script lang="ts">
export let recordings
export let fetchRecordings
import {deleteRecording} from '../lib/StorageService.ts'
import {getTimeAgo} from '../lib/utils/formateTime.ts'

fetchRecordings()

const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this recording?'))
        await deleteRecording(id), await fetchRecordings()
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

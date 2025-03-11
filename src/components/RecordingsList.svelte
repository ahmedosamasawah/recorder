<div class="recordings-list">
    <h2 class="list-title">التسجيلات السابقة</h2>

    {#if isLoading}
        <div class="loading-indicator">
            <span class="loader"></span>
            <span>جاري التحميل...</span>
        </div>
    {:else if recordingsList.length === 0}
        <div class="empty-state">
            <p>لا توجد تسجيلات سابقة</p>
            <p class="empty-hint">اضغط على زر التسجيل لبدء تسجيل جديد</p>
        </div>
    {:else}
        <ul class="recordings-items" role="listbox" aria-label="قائمة التسجيلات">
            {#each recordingsList as recording (recording.id)}
                <li
                    role="option"
                    aria-selected={currentRec?.id === recording.id}
                    tabindex="0"
                    class="recording-item {currentRec?.id === recording.id ? 'selected' : ''}"
                    on:click={() => handleSelectRecording(recording)}
                    on:keydown={e => handleKeyDown(e, recording)}
                >
                    <div class="recording-info">
                        <div class="flex items-center justify-between">
                            <div class="recording-name">{recording.name}</div>
                            <div class="recording-actions">
                                <button
                                    class="action-button edit-button"
                                    on:click|stopPropagation={() =>
                                        handleRenameRecording(recording)}
                                    title="تغيير الاسم"
                                    aria-label="تغيير الاسم"
                                >
                                    <span class="icon-wrapper">
                                        {@html EditIcon}
                                    </span>
                                </button>

                                <button
                                    class="action-button delete-button"
                                    on:click|stopPropagation={() =>
                                        handleDeleteRecording(recording)}
                                    title="حذف"
                                    aria-label="حذف"
                                >
                                    <span class="icon-wrapper">
                                        {@html DeleteIcon}
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div class="recording-meta">
                            <span class="recording-date">{getTimeAgo(recording.date)}</span>
                            <span class="recording-duration pl-4"
                                >{formatTime(recording.duration)}</span
                            >
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<script lang="ts">
import {onDestroy, onMount} from 'svelte'

import {
    currentRecording,
    deleteRecording,
    loading,
    loadRecordings,
    recordings,
    renameRecording,
    setCurrentRecording,
} from '../lib/stores/recordingStore.ts'
import type {Recording} from '../lib/types'
import {DeleteIcon, EditIcon} from '../lib/utils/icons.ts'
import {formatTime, getTimeAgo} from '../lib/utils/timeUtils.ts'

let isLoading = true
let recordingsList: Recording[] = []
let currentRec: Recording | null = null

// Subscribe to stores
const unsubRecordings = recordings.subscribe(value => (recordingsList = value))

const unsubCurrent = currentRecording.subscribe(value => (currentRec = value))

const unsubLoading = loading.subscribe(value => (isLoading = value))

function handleSelectRecording(recording: Recording) {
    setCurrentRecording(recording)
}

function handleRenameRecording(recording: Recording) {
    const newName = prompt('أدخل اسمًا جديدًا للتسجيل:', recording.name)
    if (newName && newName.trim()) renameRecording(recording.id, newName.trim())
}

function handleDeleteRecording(recording: Recording) {
    if (confirm('هل أنت متأكد من حذف هذا التسجيل؟')) deleteRecording(recording.id)
}

// Handle keyboard navigation
function handleKeyDown(event: KeyboardEvent, recording: Recording) {
    if (event.key === 'Enter' || event.key === ' ') {
        handleSelectRecording(recording)
        event.preventDefault()
    }
}

onMount(async () => await loadRecordings())

onDestroy(() => {
    unsubRecordings()
    unsubCurrent()
    unsubLoading()
})
</script>

<style>
.recordings-list {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.list-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1f2937;
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 8rem;
    color: #6b7280;
    gap: 1rem;
}

.loader {
    width: 1.5rem;
    height: 1.5rem;
    border: 3px solid #e5e7eb;
    border-top-color: #4a86e8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 8rem;
    color: #6b7280;
    text-align: center;
}

.empty-hint {
    font-size: 0.875rem;
    opacity: 0.7;
    margin-top: 0.5rem;
}

.recordings-items {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid #e5e7eb;
}

.recording-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background-color 0.2s;
}

.recording-item:hover {
    background-color: #f9fafb;
}

.recording-item:focus {
    outline: 2px solid #4a86e8;
    outline-offset: -2px;
}

.recording-item.selected {
    background-color: #f0f7ff;
}

.recording-info {
    flex: 1;
    min-width: 0;
    padding-right: 0.5rem;
}

.recording-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.selected .recording-name {
    color: #4a86e8;
}

.recording-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6b7280;
}

.recording-actions {
    display: flex;

    gap: 0.5rem;
}

.action-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition: all 0.2s;
}

.action-button:hover {
    background-color: #f3f4f6;
}

.delete-button:hover {
    color: #ef4444;
}

.icon-wrapper {
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
}
</style>

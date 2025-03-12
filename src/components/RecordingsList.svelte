<div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
    <h2 class="mb-4 text-xl font-semibold text-gray-800">التسجيلات السابقة</h2>

    {#if is_loading}
        <div class="flex h-32 flex-col items-center justify-center gap-4 text-gray-500">
            <div
                class="border-3 h-6 w-6 animate-spin rounded-full border-gray-200 border-t-blue-500"
            ></div>
            <span>جاري التحميل...</span>
        </div>
    {:else if recordings_list.length === 0}
        <div class="flex h-32 flex-col items-center justify-center text-center text-gray-500">
            <p>لا توجد تسجيلات سابقة</p>
            <p class="mt-2 text-sm opacity-70">اضغط على زر التسجيل لبدء تسجيل جديد</p>
        </div>
    {:else}
        <ul class="divide-y divide-gray-200" role="listbox" aria-label="قائمة التسجيلات">
            {#each recordings_list as recording (recording.id)}
                <li
                    role="option"
                    aria-selected={current_rec?.id === recording.id}
                    tabindex="0"
                    class="cursor-pointer px-2 py-3 transition-colors hover:bg-gray-50"
                    class:bg-blue-50={current_rec?.id === recording.id}
                    onclick={() => handle_select_recording(recording)}
                    onkeydown={e => handle_key_down(e, recording)}
                >
                    <div class="w-full">
                        <div class="flex items-center justify-between">
                            <div
                                class="line-clamp-1 font-medium"
                                class:text-blue-600={current_rec?.id === recording.id}
                            >
                                {recording.name}
                            </div>

                            <div class="flex">
                                <button
                                    class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200"
                                    onclick={e => {
                                        e.stopPropagation()
                                        handle_rename_recording(recording)
                                    }}
                                    title="تغيير الاسم"
                                    aria-label="تغيير الاسم"
                                >
                                    <div class="h-5 w-5">{@html EditIcon}</div>
                                </button>

                                <button
                                    class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-200 hover:text-red-500"
                                    onclick={e => {
                                        e.stopPropagation()
                                        handle_delete_recording(recording)
                                    }}
                                    title="حذف"
                                    aria-label="حذف"
                                >
                                    <div class="h-5 w-5">{@html DeleteIcon}</div>
                                </button>
                            </div>
                        </div>

                        <div class="flex justify-between text-sm text-gray-500">
                            <span>{get_time_ago(recording.date)}</span>
                            <span class="pl-4">{format_time(recording.duration)}</span>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<script>
import {onDestroy, onMount} from 'svelte'

import {
    loading,
    recordings,
    load_recordings,
    delete_recording,
    rename_recording,
    current_recording,
    set_current_recording,
} from '../lib/stores/recordingStore.js'
import {DeleteIcon, EditIcon} from '../lib/utils/icons.js'
import {format_time, get_time_ago} from '../lib/utils/timeUtils.js'

let is_loading = $state(true)
let current_rec = $state(null)
let recordings_list = $state([])

// Subscribe to stores
const unsub_recordings = recordings.subscribe(value => (recordings_list = value))

const unsub_current = current_recording.subscribe(value => (current_rec = value))

const unsub_loading = loading.subscribe(value => (is_loading = value))

function handle_select_recording(recording) {
    set_current_recording(recording)
}

function handle_rename_recording(recording) {
    const new_name = prompt('أدخل اسمًا جديدًا للتسجيل:', recording.name)
    if (new_name && new_name.trim()) rename_recording(recording.id, new_name.trim())
}

function handle_delete_recording(recording) {
    if (confirm('هل أنت متأكد من حذف هذا التسجيل؟')) delete_recording(recording.id)
}

// Handle keyboard navigation
function handle_key_down(event, recording) {
    if (event.key === 'Enter' || event.key === ' ') {
        handle_select_recording(recording)
        event.preventDefault()
    }
}

onMount(async () => await load_recordings())

onDestroy(() => {
    unsub_recordings()
    unsub_current()
    unsub_loading()
})
</script>

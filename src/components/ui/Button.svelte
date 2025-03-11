<button
    on:click
    {disabled}
    {title}
    class="
      {styles}
      btn-{type}
      btn fix-padding
      size-{size}
      {active ? 'active' : ''}
      {$$props.class || ''}
    "
>
    {#if icon}
        <Icon {icon} size={size === 'small' ? '1em' : size === 'medium' ? '1.25em' : '1.5em'} />
    {/if}

    {#if $$slots.default}
        <span class="btn-text"><slot /></span>
    {/if}
</button>

<script lang="ts">
import Icon from './Icon.svelte'

export let icon: string = ''
export let title: string = ''
export let styles: string = ''
export let active: boolean = false
export let disabled: boolean = false
export let size: 'small' | 'medium' | 'large' | 'circle' = 'medium'
export let type: 'primary' | 'secondary' | 'icon' | 'text' = 'primary'
</script>

<style>
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s ease;
    gap: 0.5em;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-primary {
    background-color: #4a86e8;
    color: white;
    border-radius: 4px;
}

.btn-primary:hover:not(:disabled) {
    background-color: #3a76d8;
}

.btn-secondary {
    background-color: #f5f5f5;
    color: #333;
    border-radius: 4px;
}

.btn-secondary:hover:not(:disabled) {
    background-color: #e5e5e5;
}

.btn-icon {
    background-color: transparent;
    color: #666;
    border-radius: 50%;
    padding: 0.5em;
}

.btn-icon:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
}

.btn-text {
    background-color: transparent;
    color: #4a86e8;
    padding: 0.5em;
}

.btn-text:hover:not(:disabled) {
    text-decoration: underline;
}

/* Button sizes */
.size-small {
    font-size: 0.875rem;
    padding: 0.4em 0.75em;
}

.size-medium {
    font-size: 1rem;
    padding: 0.5em 1em;
}

.size-large {
    font-size: 1.125rem;
    padding: 0.625em 1.25em;
}

.size-circle {
    border-radius: 50%;
    width: 3em;
    height: 3em;
    padding: 0;
}

.active.btn-primary {
    background-color: #3a76d8;
}

.active.btn-secondary {
    background-color: #e0e0e0;
}

.active.btn-icon {
    background-color: rgba(0, 0, 0, 0.1);
    color: #333;
}

/* Can not use in in RecordButtons directly (^_^) */
.record-button {
    color: #ef4444;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 4rem;
    height: 4rem;
}

.stop-button {
    color: #1f2937;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 4rem;
    height: 4rem;
}

/* Sorry for this one, trying to fix the download btn style (<_>) */
.fix-padding {
    padding: 0.5em;
}
</style>

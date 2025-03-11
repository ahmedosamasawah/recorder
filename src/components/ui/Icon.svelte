<span
    class={className}
    style="display: inline-block; width: {size}; justify-items: center; align-content: center; height: {size}; color: {color};"
>
    {@html icon}
</span>

<script lang="ts">
export let icon: string
export let size: string = '1em'
export let className: string = ''
export let color: string = 'currentColor'
</script>

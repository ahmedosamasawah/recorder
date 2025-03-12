<span
    class={className}
    style="display: inline-block; width: {size}; justify-items: center; align-content: center; height: {size}; color: {color};"
>
    {@html icon}
</span>

<script lang="ts">
interface Props {
    icon: string
    size?: string
    className?: string
    color?: string
}

let {icon, size = '1em', className = '', color = 'currentColor'}: Props = $props()
</script>

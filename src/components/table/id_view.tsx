import { renderWithNull } from "../shared/null_display";

export const IDView = (props: { id?: string | null }) => {
    if (!props.id) return renderWithNull(props.id);

    const id = props.id.toUpperCase();
    if (id.length <= 6) return id;

    return `${id.slice(0, 3)}...${id.slice(-3)}`;
}
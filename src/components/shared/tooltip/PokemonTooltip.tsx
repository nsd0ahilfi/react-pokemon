type PokemonTooltipProps = {
  text: string;
  tooltipText: string;
};

export function PokemonTooltip(props: PokemonTooltipProps) {
  return (
    <div className="text-cyan-900">
      <div key={props.text}>
        <span className="relative inline-flex group">
          <span className="cursor-pointer underline decoration-dotted underline-offset-4 focus:outline-none">
            {props.text}
          </span>

          <span
            role="tooltip"
            className="pointer-events-none absolute  left-1/2 -translate-x-1/2 min-w-90 rounded-lg bg-cyan-900 px-3 py-1.5 text-sm text-white shadow-lg
                   opacity-0 scale-95 transition z-50 top-[28px]
                   group-hover:opacity-100 group-hover:scale-100
                   group-focus-within:opacity-100 group-focus-within:scale-100"
          >
            {props.text} - {props?.tooltipText}
            <span
              className="absolute left-1/2 -top-[3px] h-2 w-2 -translate-x-1/2 rotate-45 bg-cyan-900"
              aria-hidden="true"
            />
          </span>
        </span>
      </div>
    </div>
  );
}

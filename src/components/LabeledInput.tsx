import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";

type Props<T> = {
  label: string;
  type: "text" | "number" | "color";
  object: T;
  name: keyof T;
};

export const LabeledInput = observer(
  <T extends {}>({ label, type, object, name }: Props<T>) => (
    <span>
      <span>{label}</span>
      <input
        type={type}
        value={object[name] as any}
        style={{ width: 50, marginLeft: 5, marginRight: 10 }}
        onChange={(e) => {
          runInAction(() => {
            if (type === "number") {
              object[name] = +e.target.value as any;
            } else {
              object[name] = e.target.value as any;
            }
          });
        }}
      />
    </span>
  )
);

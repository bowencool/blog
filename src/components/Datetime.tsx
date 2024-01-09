import i18next from "i18next";
import { useTranslation } from "react-i18next";

interface DatetimesProps {
  date: string | Date;
}

interface Props {
  pubDatetime: string | Date;
  modDatetime?: string | Date;
  size?: "sm" | "lg";
  className?: string;
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center space-x-2 opacity-80 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${
          size === "sm" ? "scale-90" : "scale-100"
        } inline-block h-6 w-6 min-w-[1.375rem] fill-skin-base`}
        aria-hidden="true"
      >
        <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
        <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
      </svg>

      <div
        className={`flex w-full justify-between italic ${
          size === "sm" ? "text-sm" : "text-base"
        }`}
      >
        <span>
          <span className="sr-only">{t("updatedAt")} </span>
          <FormattedDatetime date={pubDatetime} />
        </span>
        {modDatetime && (
          <span>
            <span aria-hidden="true">{t("updatedAt")} </span>
            <FormattedDatetime date={modDatetime} />
          </span>
        )}
      </div>
    </div>
  );
}

const FormattedDatetime = (props: DatetimesProps) => {
  const myDatetime = new Date(props.date);

  const date = myDatetime.toLocaleDateString(i18next.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const time = myDatetime.toLocaleTimeString(i18next.language, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <time dateTime={myDatetime.toISOString()}>{date}</time>
      <span aria-hidden="true"> | </span>
      <span className="sr-only">&nbsp;at&nbsp;</span>
      <span className="text-nowrap">{time}</span>
      {/* <div>
        <time dateTime={myDatetime.toISOString()}>
          {t("datetimeFormat", {
            value: myDatetime,
            formatParams: {
              val: {
                year: "numeric",
                month: "short",
                day: "numeric",
              },
            },
          })}
        </time>
      </div> */}
    </>
  );
};

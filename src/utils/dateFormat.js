import dayjs from "dayjs"
import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")

export const formatDate = (dateString) => {
  if (!dateString) return ""
  return dayjs(dateString).format("YYYY年MM月DD日 HH:mm")
}


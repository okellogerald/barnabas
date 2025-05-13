import { LoaderFunction, useParams } from "react-router-dom";
import { useAppNavigation } from "@/app";

export const MemberDetailsRouteLoader: LoaderFunction = async () => {
  const { id } = useParams();
  if (!id) {
    return useAppNavigation().Members.toList();
  }
};

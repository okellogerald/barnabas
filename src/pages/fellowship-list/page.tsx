// import React from "react";
// import { FellowshipListSuccessState, useFellowshipList } from "@/interactors/fellowship-list";
// import { AsyncPageLayout } from "@/interactors/_new_state";
// import { Flex, Typography } from "antd";

// const SuccessView: React.FC<{ state: FellowshipListSuccessState }> = ({ state }) => (
//     <Flex vertical gap="large">
//         Hello
//     </Flex>
// )

// /**
//  * Renders the Fellowship List page.
//  * Uses the useFellowshipList hook to manage state and display content.
//  */
// export const FellowshipListPage: React.FC = () => {
//     const state = useFellowshipList();

//     return (
//         <AsyncPageLayout
//             state={state}
//             SuccessView={<SuccessView />}
//         >
//         </AsyncPageLayout>
//     );
// };
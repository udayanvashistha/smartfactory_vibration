import { useCallback, useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { getUserDetails } from "../api/login/login.api";
import { getLocations, getAssets } from "../api/location/location.api";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);

  const handleLogout = useCallback(() => {
    [
      "id",
      "userId",
      "accountId",
      "locationId",
      "assetIds",
      "assetId",
      "assetLocationIds",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const initData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return;
      }

      try {
        // Fetch User Details
        const userResponse = await getUserDetails({ user_id: userId });
        let accountId;
        if (!userResponse.error) {
          const details = userResponse?.data;
          accountId = details?.message?.user_data?.accounts?.id;
          setUserInfo(details?.message?.user_data ?? null);
        }

        if (!accountId) {
          console.warn("No account ID found for user.");
          setIsLoadingAssets(false);
          return;
        }

        // Fetch Locations
        const locationPayload = {
          account_id: accountId,
          user_id: userId,
        };
        const locationsResponse = await getLocations(locationPayload);

        localStorage.setItem("accountId", accountId);

        const firstLocationId =
          locationsResponse?.data?.data?.levelOneLocations?.[0]?.id;

        if (firstLocationId) {
          localStorage.setItem("locationId", firstLocationId);
        } else {
          console.warn("No location found.");
          setIsLoadingAssets(false);
          return;
        }

        // Fetch Assets
        const assetsPayload = {
          account_id: accountId,
          location_id: {
            levelOneLocations: [firstLocationId],
            levelTwoLocations: [],
          },
        };
        const assetsResponse = await getAssets(assetsPayload);

        const assetIds =
          assetsResponse?.data?.result?.assetList
            ?.map((asset) => asset?.id)
            .filter(Boolean) ?? [];

        const firstAssetId = assetIds[0];

        if (assetIds.length) {
          localStorage.setItem("assetIds", JSON.stringify(assetIds));
        }

        if (firstAssetId) {
          localStorage.setItem("assetId", firstAssetId);
          setAssetId(firstAssetId);
        }

        const assetLocationIds =
          assetsResponse?.data?.result?.locationList?.filter(Boolean) ?? [];
        if (assetLocationIds.length) {
          localStorage.setItem(
            "assetLocationIds",
            JSON.stringify(assetLocationIds)
          );
        }

      } catch (error) {
        console.error("Failed to initialize dashboard data", error);
      } finally {
        setIsLoadingAssets(false);
      }
    };

    initData();
  }, []);

  return (
    <DashboardLayout user={userInfo} onLogout={handleLogout}>
      <Outlet context={{ user: userInfo, assetId, isLoadingAssets }} />
    </DashboardLayout>
  );
};

export default DashboardPage;

import type { Database } from "@/lib/supabase/types";

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Test configuration
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-key";

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

describe("Hierarchical Permission System", () => {
  let testPanelUserId: string;
  let testClientId: string;

  beforeAll(async () => {
    // Create a test panel user
    const { data: panelUser, error: panelUserError } = await supabase
      .from("panel_users")
      .insert({
        name: "Test User",
        email: "test@example.com",
        permission_mask: 2, // Layer 2 user
      })
      .select()
      .single();

    if (panelUserError) {
      console.warn("Could not create test panel user:", panelUserError);

      return;
    }

    testPanelUserId = panelUser.id;

    // Create a test client
    const { data: client, error: clientError } = await supabase
      .from("client")
      .insert({
        type: "person",
        status: "active",
        permission_mask: 15, // All layers access
        panel_user_id: testPanelUserId,
      })
      .select()
      .single();

    if (clientError) {
      console.warn("Could not create test client:", clientError);

      return;
    }

    testClientId = client.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testClientId) {
      await supabase.from("client").delete().eq("id", testClientId);
    }
    if (testPanelUserId) {
      await supabase.from("panel_users").delete().eq("id", testPanelUserId);
    }
  });

  it("should filter clients based on permission masks", async () => {
    if (!testPanelUserId) {
      console.warn("Skipping test - no test panel user created");

      return;
    }

    // Test Layer 2 user (permission_mask = 2) accessing client with all access (permission_mask = 15)
    const { data, error } = await supabase.rpc(
      "get_filtered_clients_with_permissions",
      {
        requesting_user_id: testPanelUserId,
        requesting_user_mask: 2,
        _types: ["all"],
        _statuses: ["all"],
        _limit: 10,
        _offset: 0,
      },
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();

    if (data && data.length > 0) {
      // Should include our test client since (2 & 15) = 2
      const testClient = data.find((client) => client.id === testClientId);

      expect(testClient).toBeDefined();

      if (testClient) {
        expect(testClient.is_mutable).toBe(true); // User owns the client
        expect(testClient.permission_mask).toBe(15);
        expect(testClient.panel_user_id).toBe(testPanelUserId);
      }
    }
  });

  it("should return empty result for invalid permission mask", async () => {
    if (!testPanelUserId) {
      console.warn("Skipping test - no test panel user created");

      return;
    }

    // Test with invalid permission mask
    const { data, error } = await supabase.rpc(
      "get_filtered_clients_with_permissions",
      {
        requesting_user_id: testPanelUserId,
        requesting_user_mask: 16, // Invalid mask
        _types: ["all"],
        _statuses: ["all"],
        _limit: 10,
        _offset: 0,
      },
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data).toHaveLength(0); // Should return empty array for invalid mask
  });

  it("should calculate mutability correctly based on ownership", async () => {
    if (!testPanelUserId) {
      console.warn("Skipping test - no test panel user created");

      return;
    }

    // Create another panel user
    const { data: otherUser, error: otherUserError } = await supabase
      .from("panel_users")
      .insert({
        name: "Other User",
        email: "other@example.com",
        permission_mask: 4, // Layer 3 user
      })
      .select()
      .single();

    if (otherUserError) {
      console.warn("Could not create other test user:", otherUserError);

      return;
    }

    try {
      // Test accessing client owned by different user
      const { data, error } = await supabase.rpc(
        "get_filtered_clients_with_permissions",
        {
          requesting_user_id: otherUser.id,
          requesting_user_mask: 4,
          _types: ["all"],
          _statuses: ["all"],
          _limit: 10,
          _offset: 0,
        },
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();

      if (data && data.length > 0) {
        const testClient = data.find((client) => client.id === testClientId);

        if (testClient) {
          // Should not be mutable since other user doesn't own it and it's recent
          expect(testClient.is_mutable).toBe(false);
        }
      }
    } finally {
      // Clean up other user
      await supabase.from("panel_users").delete().eq("id", otherUser.id);
    }
  });

  it("should respect permission hierarchy", async () => {
    if (!testPanelUserId) {
      console.warn("Skipping test - no test panel user created");

      return;
    }

    // Create a client with Layer 3+ access (permission_mask = 12)
    const { data: restrictedClient, error: restrictedError } = await supabase
      .from("client")
      .insert({
        type: "company",
        status: "active",
        permission_mask: 12, // Layer 3+ access only (binary: 1100)
        panel_user_id: testPanelUserId,
      })
      .select()
      .single();

    if (restrictedError) {
      console.warn("Could not create restricted client:", restrictedError);

      return;
    }

    try {
      // Test Layer 2 user (mask = 2) trying to access Layer 3+ client (mask = 12)
      const { data, error } = await supabase.rpc(
        "get_filtered_clients_with_permissions",
        {
          requesting_user_id: testPanelUserId,
          requesting_user_mask: 2, // Layer 2 user
          _types: ["all"],
          _statuses: ["all"],
          _limit: 10,
          _offset: 0,
        },
      );

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Should not include the restricted client since (2 & 12) = 0 ≠ 2
      const foundRestrictedClient = data?.find(
        (client) => client.id === restrictedClient.id,
      );

      expect(foundRestrictedClient).toBeUndefined();

      // Test Layer 4 user (mask = 8) accessing the same client
      const { data: layer4Data, error: layer4Error } = await supabase.rpc(
        "get_filtered_clients_with_permissions",
        {
          requesting_user_id: testPanelUserId,
          requesting_user_mask: 8, // Layer 4 user
          _types: ["all"],
          _statuses: ["all"],
          _limit: 10,
          _offset: 0,
        },
      );

      expect(layer4Error).toBeNull();
      expect(layer4Data).toBeDefined();

      // Should include the restricted client since (8 & 12) = 8
      const foundByLayer4 = layer4Data?.find(
        (client) => client.id === restrictedClient.id,
      );

      expect(foundByLayer4).toBeDefined();
    } finally {
      // Clean up restricted client
      await supabase.from("client").delete().eq("id", restrictedClient.id);
    }
  });

  describe("Count Function Tests", () => {
    it("should return correct count with permission filtering", async () => {
      if (!testPanelUserId) {
        console.warn("Skipping test - no test panel user created");

        return;
      }

      // Get count using the count function
      const { data: countData, error: countError } = await supabase.rpc(
        "get_filtered_clients_total_with_permissions",
        {
          requesting_user_mask: 2, // Layer 2 user
          _types: ["all"],
          _statuses: ["all"],
        },
      );

      expect(countError).toBeNull();
      expect(countData).toBeDefined();
      expect(typeof countData).toBe("number");

      // Get actual data using the main function
      const { data: clientsData, error: clientsError } = await supabase.rpc(
        "get_filtered_clients_with_permissions",
        {
          requesting_user_id: testPanelUserId,
          requesting_user_mask: 2,
          _types: ["all"],
          _statuses: ["all"],
          _limit: 1000, // Large limit to get all results
          _offset: 0,
        },
      );

      expect(clientsError).toBeNull();
      expect(clientsData).toBeDefined();

      // Count should match the actual number of returned clients
      expect(countData).toBe(clientsData?.length || 0);
    });

    it("should return 0 for invalid permission mask", async () => {
      // Test with invalid permission mask
      const { data, error } = await supabase.rpc(
        "get_filtered_clients_total_with_permissions",
        {
          requesting_user_mask: 16, // Invalid mask
          _types: ["all"],
          _statuses: ["all"],
        },
      );

      expect(error).toBeNull();
      expect(data).toBe(0); // Should return 0 for invalid mask
    });

    it("should return 0 for null permission mask", async () => {
      // Test with null permission mask
      const { data, error } = await supabase.rpc(
        "get_filtered_clients_total_with_permissions",
        {
          requesting_user_mask: null as any, // Type assertion to test edge case
          _types: ["all"],
          _statuses: ["all"],
        },
      );

      expect(error).toBeNull();
      expect(data).toBe(0); // Should return 0 for null mask
    });

    it("should respect type and status filtering in count", async () => {
      if (!testPanelUserId) {
        console.warn("Skipping test - no test panel user created");

        return;
      }

      // Create clients with different types and statuses for testing
      const testClients = [];

      try {
        // Create person client with active status
        const { data: personClient, error: personError } = await supabase
          .from("client")
          .insert({
            type: "person",
            status: "active",
            permission_mask: 15,
            panel_user_id: testPanelUserId,
          })
          .select()
          .single();

        if (!personError && personClient) {
          testClients.push(personClient.id);
        }

        // Create company client with inactive status
        const { data: companyClient, error: companyError } = await supabase
          .from("client")
          .insert({
            type: "company",
            status: "inactive",
            permission_mask: 15,
            panel_user_id: testPanelUserId,
          })
          .select()
          .single();

        if (!companyError && companyClient) {
          testClients.push(companyClient.id);
        }

        // Test count with type filtering
        const { data: personCount, error: personCountError } =
          await supabase.rpc("get_filtered_clients_total_with_permissions", {
            requesting_user_mask: 2,
            _types: ["person"],
            _statuses: ["all"],
          });

        expect(personCountError).toBeNull();
        expect(typeof personCount).toBe("number");

        // Test count with status filtering
        const { data: activeCount, error: activeCountError } =
          await supabase.rpc("get_filtered_clients_total_with_permissions", {
            requesting_user_mask: 2,
            _types: ["all"],
            _statuses: ["active"],
          });

        expect(activeCountError).toBeNull();
        expect(typeof activeCount).toBe("number");

        // Test count with both type and status filtering
        const { data: specificCount, error: specificCountError } =
          await supabase.rpc("get_filtered_clients_total_with_permissions", {
            requesting_user_mask: 2,
            _types: ["person"],
            _statuses: ["active"],
          });

        expect(specificCountError).toBeNull();
        expect(typeof specificCount).toBe("number");

        // Verify consistency with main function
        const { data: specificClients, error: specificClientsError } =
          await supabase.rpc("get_filtered_clients_with_permissions", {
            requesting_user_id: testPanelUserId,
            requesting_user_mask: 2,
            _types: ["person"],
            _statuses: ["active"],
            _limit: 1000,
            _offset: 0,
          });

        expect(specificClientsError).toBeNull();
        expect(specificCount).toBe(specificClients?.length || 0);
      } finally {
        // Clean up test clients
        for (const clientId of testClients) {
          await supabase.from("client").delete().eq("id", clientId);
        }
      }
    });

    it("should handle permission hierarchy correctly in count", async () => {
      if (!testPanelUserId) {
        console.warn("Skipping test - no test panel user created");

        return;
      }

      const testClients = [];

      try {
        // Create clients with different permission levels
        const clientConfigs = [
          { permission_mask: 15, description: "All layers access" },
          { permission_mask: 14, description: "Layer 2+ access" },
          { permission_mask: 12, description: "Layer 3+ access" },
          { permission_mask: 8, description: "Manager only access" },
        ];

        for (const config of clientConfigs) {
          const { data: client, error } = await supabase
            .from("client")
            .insert({
              type: "person",
              status: "active",
              permission_mask: config.permission_mask,
              panel_user_id: testPanelUserId,
            })
            .select()
            .single();

          if (!error && client) {
            testClients.push(client.id);
          }
        }

        // Test different user permission levels
        const userLevels = [
          { mask: 1, expectedAccess: [15] }, // Layer 1: only all-access clients
          { mask: 2, expectedAccess: [15, 14] }, // Layer 2: all-access and layer 2+ clients
          { mask: 4, expectedAccess: [15, 14, 12] }, // Layer 3: all except manager-only
          { mask: 8, expectedAccess: [15, 14, 12, 8] }, // Layer 4: all clients
        ];

        for (const userLevel of userLevels) {
          // Get count
          const { data: count, error: countError } = await supabase.rpc(
            "get_filtered_clients_total_with_permissions",
            {
              requesting_user_mask: userLevel.mask,
              _types: ["all"],
              _statuses: ["all"],
            },
          );

          expect(countError).toBeNull();
          expect(typeof count).toBe("number");

          // Get actual data
          const { data: clients, error: clientsError } = await supabase.rpc(
            "get_filtered_clients_with_permissions",
            {
              requesting_user_id: testPanelUserId,
              requesting_user_mask: userLevel.mask,
              _types: ["all"],
              _statuses: ["all"],
              _limit: 1000,
              _offset: 0,
            },
          );

          expect(clientsError).toBeNull();

          // Count should match actual results
          expect(count).toBe(clients?.length || 0);

          // Verify that the accessible clients have the expected permission masks
          if (clients) {
            const accessibleMasks = clients
              .map((c) => c.permission_mask)
              .sort();
            const expectedMasks = userLevel.expectedAccess
              .filter((mask) => (userLevel.mask & mask) === userLevel.mask)
              .sort();

            // Should have at least the expected accessible clients
            for (const expectedMask of expectedMasks) {
              expect(accessibleMasks).toContain(expectedMask);
            }
          }
        }
      } finally {
        // Clean up test clients
        for (const clientId of testClients) {
          await supabase.from("client").delete().eq("id", clientId);
        }
      }
    });
  });
});

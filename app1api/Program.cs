using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var authSecret = builder.Configuration["Auth:Secret"]
    ?? throw new InvalidOperationException("Auth:Secret is missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authSecret)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5001")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/hello", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("sub")?.Value
        ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var email = user.FindFirst("email")?.Value;
    var isAdmin = user.FindFirst("isAdmin")?.Value == "true";

    return Results.Ok(new
    {
        message = $"Hello {email ?? "user"}",
        userId,
        isAdmin
    });
})
.RequireAuthorization();

app.MapGet("/api/projects", (ClaimsPrincipal user) =>
{
    var userId = user.FindFirst("sub")?.Value
        ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // Fake data for now — later this comes from DB
    var projects = new[]
    {
        new { id = 1, project_name = "Demo project", user_id = userId }
    };

    return Results.Ok(projects);
})
.RequireAuthorization();

app.Run("http://localhost:5005");